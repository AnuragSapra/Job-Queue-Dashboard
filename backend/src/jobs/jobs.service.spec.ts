import { describe, it, expect, beforeEach, vi } from 'vitest';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { JobsService } from './jobs.service.js';
import { Job } from './job.entity.js';
import { JobStatus } from './job-status.enum.js';

describe('JobsService', () => {
  let service: JobsService;

  const repository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    findOneByOrFail: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should create a job', async () => {
    const dto = {
      title: 'Build portfolio',
      type: 'frontend',
    };

    const job = {
      id: 1,
      ...dto,
      status: JobStatus.PENDING,
    };

    repository.create.mockReturnValue(job);
    repository.save.mockResolvedValue(job);

    await expect(service.create(dto)).resolves.toEqual(job);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(job);
  });

  it('should return all jobs', async () => {
    const jobs = [
      { id: 2, title: 'Job 2' },
      { id: 1, title: 'Job 1' },
    ];

    repository.find.mockResolvedValue(jobs);

    await expect(service.findAll()).resolves.toEqual(jobs);

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should reject an invalid status transition', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      status: JobStatus.PENDING,
    });

    await expect(
      service.updateStatus(1, {
        status: JobStatus.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject updating a job that does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(
      service.updateStatus(999, {
        status: JobStatus.RUNNING,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update a job when the transition is valid', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      status: JobStatus.PENDING,
    });

    const execute = vi.fn().mockResolvedValue({ affected: 1 });

    const queryBuilder = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute,
    };

    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const updatedJob = {
      id: 1,
      status: JobStatus.RUNNING,
    };

    repository.findOneByOrFail.mockResolvedValue(updatedJob);

    await expect(
      service.updateStatus(1, {
        status: JobStatus.RUNNING,
      }),
    ).resolves.toEqual(updatedJob);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'status = :currentStatus',
      {
        currentStatus: JobStatus.PENDING,
      },
    );
  });

  it('should reject a concurrent stale update', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      status: JobStatus.PENDING,
    });

    const queryBuilder = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 0 }),
    };

    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.updateStatus(1, {
        status: JobStatus.RUNNING,
      }),
    ).rejects.toThrow('Job status was changed by another request');
  });

  it('should delete an existing job', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();

    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('should reject deleting a job that does not exist', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
