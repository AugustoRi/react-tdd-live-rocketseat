// Mock = Input

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) {}

  async exec(groupId: string): Promise<void> {
    await this.loadLastEventRepository.loadLastEvent(groupId)
  }
}

// DB or something else that returns data
interface LoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<void>
}

class LoadLastEventRepositoryMock implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0

  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId
    this.callsCount++
  }
}

describe('Check Last Event Status', () => {
  it('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock()
    const checkLastEventStatus = new CheckLastEventStatus(loadLastEventRepository)

    await checkLastEventStatus.exec('any_group_id')

    expect(loadLastEventRepository.groupId).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
  });
});