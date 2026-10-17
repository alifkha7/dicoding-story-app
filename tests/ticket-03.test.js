import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePresenter from '../src/scripts/pages/home/home-presenter';

describe('Ticket 03 Unit Tests — HomePresenter', () => {
  let fakeView;
  let fakeStoryModel;
  let fakeAuthModel;

  const mockStories = [
    {
      id: 'story-1',
      name: 'Dimas',
      description: 'Cerita di Jakarta',
      photoUrl: 'https://img.test/1.png',
      createdAt: '2026-01-01T00:00:00.000Z',
      lat: -6.2088,
      lon: 106.8456,
    },
    {
      id: 'story-2',
      name: 'Budi',
      description: 'Cerita tanpa koordinat',
      photoUrl: 'https://img.test/2.png',
      createdAt: '2026-01-02T00:00:00.000Z',
      lat: null,
      lon: null,
    },
    {
      id: 'story-3',
      name: 'Siti',
      description: 'Cerita di Bandung',
      photoUrl: 'https://img.test/3.png',
      createdAt: '2026-01-03T00:00:00.000Z',
      lat: -6.9175,
      lon: 107.6191,
    },
  ];

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
      clearError: vi.fn(),
      renderStories: vi.fn(),
      renderMapMarkers: vi.fn(),
      updateFilterUI: vi.fn(),
      highlightActiveCard: vi.fn(),
      focusMapOnCoordinates: vi.fn(),
    };

    fakeStoryModel = {
      getStories: vi.fn().mockResolvedValue({
        error: false,
        message: 'Stories fetched successfully',
        listStory: mockStories,
      }),
    };

    fakeAuthModel = {
      getToken: vi.fn().mockReturnValue('mock-token-xyz'),
    };
  });

  it('should load stories and render all stories and markers by default', async () => {
    const presenter = new HomePresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStories();

    expect(fakeView.showLoading).toHaveBeenCalled();
    expect(fakeStoryModel.getStories).toHaveBeenCalledWith({
      token: 'mock-token-xyz',
      location: 0,
      size: 50,
    });
    expect(fakeView.renderStories).toHaveBeenCalledWith(mockStories);
    // Only stories with valid coordinates should be plotted as markers
    expect(fakeView.renderMapMarkers).toHaveBeenCalledWith([mockStories[0], mockStories[2]]);
    expect(fakeView.updateFilterUI).toHaveBeenCalledWith('all');
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should filter stories when applyFilter("located") is called', async () => {
    const presenter = new HomePresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStories();
    presenter.applyFilter('located');

    expect(presenter.getLocationFilter()).toBe('located');
    expect(fakeView.renderStories).toHaveBeenLastCalledWith([mockStories[0], mockStories[2]]);
    expect(fakeView.renderMapMarkers).toHaveBeenLastCalledWith([mockStories[0], mockStories[2]]);
    expect(fakeView.updateFilterUI).toHaveBeenLastCalledWith('located');
  });

  it('should synchronize active story with view card highlight and map focus', async () => {
    const presenter = new HomePresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStories();
    presenter.selectActiveStory('story-1');

    expect(presenter.getActiveStoryId()).toBe('story-1');
    expect(fakeView.highlightActiveCard).toHaveBeenCalledWith('story-1');
    expect(fakeView.focusMapOnCoordinates).toHaveBeenCalledWith({
      lat: -6.2088,
      lon: 106.8456,
      storyId: 'story-1',
    });
  });

  it('should handle API load error gracefully', async () => {
    fakeStoryModel.getStories.mockRejectedValue(new Error('Network offline'));

    const presenter = new HomePresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStories();

    expect(fakeView.showError).toHaveBeenCalledWith('Network offline');
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });
});
