import { describe, it, expect, beforeEach, vi } from 'vitest';
import StoryDetailPresenter from '../src/scripts/pages/stories/story-detail-presenter';

describe('StoryDetailPresenter Tests', () => {
  let fakeView;
  let fakeStoryModel;
  let fakeAuthModel;

  const mockStoryWithLoc = {
    id: 'story-123',
    name: 'Arif Faizin',
    description: 'Menikmati pemandangan Gunung Bromo.',
    photoUrl: 'https://img.test/bromo.jpg',
    createdAt: '2026-03-01T10:00:00.000Z',
    lat: -7.9425,
    lon: 112.9530,
  };

  const mockStoryNoLoc = {
    id: 'story-456',
    name: 'Dimas',
    description: 'Belajar web intermediate.',
    photoUrl: 'https://img.test/code.jpg',
    createdAt: '2026-03-02T12:00:00.000Z',
    lat: null,
    lon: null,
  };

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
      clearError: vi.fn(),
      renderStoryDetail: vi.fn(),
      renderLocationMap: vi.fn(),
      showNoLocationNotice: vi.fn(),
    };

    fakeStoryModel = {
      getStoryDetail: vi.fn(),
    };

    fakeAuthModel = {
      getToken: vi.fn().mockReturnValue('mock-jwt-token'),
    };
  });

  it('should validate missing story ID', async () => {
    const presenter = new StoryDetailPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStoryDetail(null);
    expect(fakeView.showError).toHaveBeenCalledWith('ID cerita tidak valid.');
    expect(fakeStoryModel.getStoryDetail).not.toHaveBeenCalled();
  });

  it('should fetch story detail and render location map when coordinates exist', async () => {
    fakeStoryModel.getStoryDetail.mockResolvedValue({
      error: false,
      message: 'Story fetched successfully',
      story: mockStoryWithLoc,
    });

    const presenter = new StoryDetailPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStoryDetail('story-123');

    expect(fakeView.showLoading).toHaveBeenCalled();
    expect(fakeStoryModel.getStoryDetail).toHaveBeenCalledWith({
      token: 'mock-jwt-token',
      id: 'story-123',
    });
    expect(fakeView.renderStoryDetail).toHaveBeenCalledWith(mockStoryWithLoc);
    expect(fakeView.renderLocationMap).toHaveBeenCalledWith({
      lat: -7.9425,
      lon: 112.9530,
      name: 'Arif Faizin',
      description: 'Menikmati pemandangan Gunung Bromo.',
    });
    expect(fakeView.showNoLocationNotice).not.toHaveBeenCalled();
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should display no-location notice when story has no coordinates', async () => {
    fakeStoryModel.getStoryDetail.mockResolvedValue({
      error: false,
      message: 'Story fetched successfully',
      story: mockStoryNoLoc,
    });

    const presenter = new StoryDetailPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStoryDetail('story-456');

    expect(fakeView.renderStoryDetail).toHaveBeenCalledWith(mockStoryNoLoc);
    expect(fakeView.showNoLocationNotice).toHaveBeenCalled();
    expect(fakeView.renderLocationMap).not.toHaveBeenCalled();
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    fakeStoryModel.getStoryDetail.mockRejectedValue(new Error('Story not found'));

    const presenter = new StoryDetailPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    await presenter.loadStoryDetail('bad-id');

    expect(fakeView.showError).toHaveBeenCalledWith('Story not found');
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should manage bookmarks via presenter with injected database', async () => {
    const fakeDatabase = {
      isBookmarked: vi.fn().mockResolvedValue(false),
      saveBookmark: vi.fn().mockResolvedValue(undefined),
      deleteBookmark: vi.fn().mockResolvedValue(undefined),
    };

    const presenter = new StoryDetailPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
      database: fakeDatabase,
    });

    // Check isBookmarked
    const isSaved = await presenter.isBookmarked('story-123');
    expect(isSaved).toBe(false);
    expect(fakeDatabase.isBookmarked).toHaveBeenCalledWith('story-123');

    // Toggle bookmark when not saved -> saves and returns true
    const toggleResult1 = await presenter.toggleBookmark(mockStoryWithLoc);
    expect(toggleResult1).toBe(true);
    expect(fakeDatabase.saveBookmark).toHaveBeenCalledWith(mockStoryWithLoc);

    // Toggle bookmark when saved -> deletes and returns false
    fakeDatabase.isBookmarked.mockResolvedValue(true);
    const toggleResult2 = await presenter.toggleBookmark(mockStoryWithLoc);
    expect(toggleResult2).toBe(false);
    expect(fakeDatabase.deleteBookmark).toHaveBeenCalledWith('story-123');
  });
});
