import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Query,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { EnrollmentsService } from '../../../enrollments/enrollments.service';
import {
  CreateEnrollmentDto,
  RequirementChecklistDto,
} from '../../../enrollments/dto/create-enrollment.dto';
import {
  UpdateEnrollmentStatusDto,
  EnrollmentFilterDto,
} from '../../../enrollments/dto/update-enrollment.dto';

@Controller('registrar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.REGISTRAR)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('trainees/search')
  async searchTrainees(@Query('q') query: string) {
    return this.enrollmentsService.searchTrainees(query);
  }

  @Get('enrollments/search/trainees')
  async searchTraineesLegacy(@Query('q') query: string) {
    return this.enrollmentsService.searchTrainees(query);
  }

  @Get('enrollments/available/batches')
  async getAvailableBatches(
    @Query('traineeId', new ParseUUIDPipe({ optional: true }))
    traineeId?: string,
  ) {
    return this.enrollmentsService.getAvailableBatches(traineeId);
  }

  @Get('enrollments/programs')
  async getPrograms() {
    return this.enrollmentsService.getPrograms();
  }

  @Get('enrollments')
  async getEnrollments(@Query() filters: EnrollmentFilterDto) {
    return this.enrollmentsService.getEnrollments(filters);
  }

  @Get('enrollments/:id')
  async getEnrollmentDetail(@Param('id', ParseUUIDPipe) enrollmentId: string) {
    return this.enrollmentsService.getEnrollmentDetail(enrollmentId);
  }

  @Post('enrollments')
  async createEnrollment(
    @Body() createDto: CreateEnrollmentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.enrollmentsService.createEnrollment(createDto, currentUser.id);
  }

  @Patch('enrollments/:id/status')
  async updateEnrollmentStatus(
    @Param('id', ParseUUIDPipe) enrollmentId: string,
    @Body() updateDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentsService.updateEnrollmentStatus(
      enrollmentId,
      updateDto,
    );
  }

  @Patch('enrollments/:id/requirements')
  async updateRequirementChecklist(
    @Param('id', ParseUUIDPipe) enrollmentId: string,
    @Body() checklist: RequirementChecklistDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.enrollmentsService.updateRequirementChecklist(
      enrollmentId,
      checklist,
      currentUser.id,
    );
  }
}
