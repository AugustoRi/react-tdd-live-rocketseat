// Mock = Input
// Stub = Output
// Spy = Input and Output

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) {}

  async exec(groupId: string): Promise<string> {
    await this.loadLastEventRepository.loadLastEvent(groupId)
    return 'done'
  }
}

// DB or something else that returns data
interface LoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<void>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output: undefined

  async loadLastEvent(groupId: string): Promise<undefined> {
    this.groupId = groupId
    this.callsCount++
    return this.output
  }
}

describe('Check Last Event Status', () => {
  it('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    const sut = new CheckLastEventStatus(loadLastEventRepository)

    await sut.exec('any_group_id')

    expect(loadLastEventRepository.groupId).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
  });
});

describe('Check Last Event Status', () => {
  it('should return status done when group has no event', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    loadLastEventRepository.output = undefined
    const sut = new CheckLastEventStatus(loadLastEventRepository)

    const status = await sut.exec('any_group_id')

    expect(status).toBe('done')
  });
});