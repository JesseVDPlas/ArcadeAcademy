import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { UserProvider, useUser } from '../UserContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

const TestComponent = () => {
  const { name, soundOn, setName, toggleSound } = useUser();
  return (
    <>
      <Text testID="name">{name}</Text>
      <Text testID="sound">{soundOn ? 'on' : 'off'}</Text>
      <Text testID="setName" onPress={() => setName('Jesse')}>setName</Text>
      <Text testID="toggleSound" onPress={toggleSound}>toggleSound</Text>
    </>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
  });

  it('should set name and persist to AsyncStorage', async () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    await act(async () => {
      getByTestId('setName').props.onPress();
    });
    expect(getByTestId('name').children[0]).toBe('Jesse');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', expect.stringContaining('Jesse'));
  });

  it('should toggle sound and persist to AsyncStorage', async () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    const initial = getByTestId('sound').children[0];
    await act(async () => {
      getByTestId('toggleSound').props.onPress();
    });
    const toggled = getByTestId('sound').children[0];
    expect(toggled).not.toBe(initial);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));
  });
}); 