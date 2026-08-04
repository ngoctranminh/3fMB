jest.mock('react-native-mmkv', () => {
  const { createMockMMKV } = jest.requireActual<{
    createMockMMKV: (config?: { id: string }) => unknown;
  }>('react-native-mmkv/src/createMMKV/createMockMMKV');

  return {
    createMMKV: (config?: { id: string }) => createMockMMKV(config),
    MMKV: Object,
  };
});
