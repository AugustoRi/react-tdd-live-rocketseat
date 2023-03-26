// Mock = Input
// Stub = Output
// Spy = Input and Output
import { set, reset } from 'mockdate'

type EventStatus = { status: 'active' | 'inReview' | 'done' }

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) {}

  async exec ({ groupId } : { groupId: string }): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId })
    if (event === undefined) return { status: 'done' }
    const now = new Date()
    return event.endDate >= now ? { status: 'active' } : { status: 'inReview' }
  }
}

type LoadLastEventRepositoryPropsReturn = {
  endDate: Date
  reviewDurationInHours: number
}

// DB or something else that returns data
interface LoadLastEventRepository {
  loadLastEvent: (input : { groupId: string }) => Promise<LoadLastEventRepositoryPropsReturn | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: LoadLastEventRepositoryPropsReturn

  handleSendEndDateBeforeNow = (): void => {
    this.output = {
      endDate: new Date(new Date().getTime() - 1),
      reviewDurationInHours: 1
    }
  }

  handleSendEndDateEqualNow = (): void => {
    this.output = {
      endDate: new Date(),
      reviewDurationInHours: 1
    }
  }

  handleSendEndDateAfterNow = (): void => {
    this.output = {
      endDate: new Date(new Date().getTime() + 1),
      reviewDurationInHours: 1
    }
  }

  handleSendDateWithNowBeforeReviewTime = (): void => {
    const reviewDurationInHours = 1
    const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000
    this.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMs + 1),
      reviewDurationInHours
    }
  }

  handleSendDateWithNowEqualReviewTime = (): void => {
    const reviewDurationInHours = 1
    const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000
    this.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMs),
      reviewDurationInHours
    }
  }

  async loadLastEvent({ groupId } : { groupId: string }): Promise<LoadLastEventRepositoryPropsReturn | undefined> {
    this.groupId = groupId
    this.callsCount++
    return this.output
  }
}

type SutOutput = {
  sut: CheckLastEventStatus
  loadLastEventRepository: LoadLastEventRepositorySpy
}

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy()
  const sut = new CheckLastEventStatus(loadLastEventRepository)
  return {
    sut,
    loadLastEventRepository
  }
}

describe('CheckLastEventStatus', () => {
  const groupId = 'any_group_id'

  beforeAll(() => {
    set(new Date())
  })

  afterAll(() => {
    reset()
  })

  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.exec({ groupId })

    expect(loadLastEventRepository.groupId).toBe(groupId)
    expect(loadLastEventRepository.callsCount).toBe(1)
  });

  it('should return status done when group has no event', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('done')
  });

  it('should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.handleSendEndDateAfterNow()

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('active')
  });

  it('should return status active when now is equal to event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.handleSendEndDateEqualNow()

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('active')
  });

  it('should return status inReview when now is after event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.handleSendEndDateBeforeNow()

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('inReview')
  });

  it('should return status inReview when now is before review time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.handleSendDateWithNowBeforeReviewTime()

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('inReview')
  });

  it('should return status inReview when now is equal to review time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.handleSendDateWithNowEqualReviewTime()

    const { status } = await sut.exec({ groupId })

    expect(status).toBe('inReview')
  });
});