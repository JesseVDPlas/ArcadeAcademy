import React from 'react';
import { render } from '@testing-library/react-native';

import DailyChallengeMap from '@/components/home/DailyChallengeMap';
import QuizTab from '@/app/(tabs)/quiz/index';
import { useRouter } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';

const capturedTiles: any[] = [];

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    FontAwesome: (props: any) => React.createElement('Icon', props, props.name ?? 'icon'),
  };
});

jest.mock('@/components/home/LevelTile', () => {
  const React = require('react');
  return (props: any) => {
    capturedTiles.push(props);
    return React.createElement('mock-level-tile', props);
  };
});

const pushMock = jest.fn();

beforeEach(() => {
  capturedTiles.length = 0;
  (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  (useToast as jest.Mock).mockReturnValue({ show: jest.fn() });
  (useUser as jest.Mock).mockReturnValue({
    dailyChallenge: {
      order: [],
      progress: {},
    },
  });
  pushMock.mockClear();
});

describe('Navigation safety', () => {
  it('routes daily challenge tiles through /(tabs)/quiz/[subject]', () => {
    (useUser as jest.Mock).mockReturnValue({
      dailyChallenge: {
        order: ['hist', 'nl', 'math', 'geo'],
        progress: { hist: 'current', nl: 'locked', math: 'locked', geo: 'locked' },
      },
    });

    render(<DailyChallengeMap />);

    const currentTile = capturedTiles.find(tile => tile.subjectId === 'hist');
    expect(currentTile).toBeDefined();
    currentTile.onPress?.();

    expect(pushMock).toHaveBeenCalledWith({
      pathname: '/(tabs)/quiz/[subject]',
      params: { subject: 'hist', daily: '1', dailySubjectId: 'hist' },
    });
  });

  it('routes quiz landing tiles through /(tabs)/quiz/[subject]', () => {
    render(<QuizTab />);

    const tile = capturedTiles.find(props => props.subjectId === 'nl');
    expect(tile).toBeDefined();

    tile.onPress?.();

    expect(pushMock).toHaveBeenCalledWith({
      pathname: '/(tabs)/quiz/[subject]',
      params: { subject: 'nl' },
    });
  });
});
