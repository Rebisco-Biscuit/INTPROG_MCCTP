import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { TraineeListQueryDto } from '../../../student-information/dto/trainee-list-query.dto';
import { StudentInformationService } from '../../../student-information/student-information.service';

/**
 * Read-only Student Information for registrars (MP-24).
 * Registered after EnrollmentsController so its GET trainees/search keeps
 * matching before trainees/:id here.
 */
@Controller('registrar/trainees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.REGISTRAR)
// Search-as-you-type and paging exceed the global 15 requests/minute.
@Throttle({ default: { limit: 120, ttl: 60000 } })
export class RegistrarTraineesController {
  constructor(
    private readonly studentInformationService: StudentInformationService,
  ) {}

  /** GET /api/registrar/trainees */
  @Get()
  findAll(@Query() query: TraineeListQueryDto) {
    return this.studentInformationService.listTrainees(query);
  }

  /** GET /api/registrar/trainees/filter-options */
  @Get('filter-options')
  getFilterOptions() {
    return this.studentInformationService.getFilterOptions();
  }

  /** GET /api/registrar/trainees/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentInformationService.getTraineeProfile(id);
  }
}
