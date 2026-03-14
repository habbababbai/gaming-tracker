const mockClient = {
  fields: () => mockClient,
  search: () => mockClient,
  where: () => mockClient,
  limit: () => mockClient,
  request: jest.fn().mockResolvedValue({ data: [] }),
};

const igdb = jest.fn().mockReturnValue(mockClient);

export default igdb;
