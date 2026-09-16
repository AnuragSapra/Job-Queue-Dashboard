import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from './job.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobStatusDto } from './dto/update-job-status.dto.js';
import { JobStatus } from './job-status.enum.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(createJobDto);

    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(
    id: number,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOneBy({ id });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const allowedTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.RUNNING],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    if (!allowedTransitions[job.status].includes(updateJobStatusDto.status)) {
      throw new BadRequestException(
        `Cannot change job status from ${job.status} to ${updateJobStatusDto.status}`,
      );
    }

    const result = await this.jobsRepository
      .createQueryBuilder()
      .update(Job)
      .set({ status: updateJobStatusDto.status })
      .where('id = :id', { id })
      .andWhere('status = :currentStatus', {
        currentStatus: job.status,
      })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException(
        'Job status was changed by another request',
      );
    }

    return this.jobsRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<void> {
    const result = await this.jobsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }
}
