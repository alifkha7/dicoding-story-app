import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddStoryPresenter from '../src/scripts/pages/stories/add-story-presenter';

describe('AddStoryPresenter Tests', () => {
  let fakeView;
  let fakeStoryModel;
  let fakeAuthModel;

  const validPhoto = {
    size: 500 * 1024, // 500 KB (< 1 MB)
    type: 'image/jpeg',
  };

  const oversizedPhoto = {
    size: 2 * 1024 * 1024, // 2 MB (> 1 MB)
    type: 'image/jpeg',
  };

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
      showSuccess: vi.fn(),
      clearFeedback: vi.fn(),
      navigateToHome: vi.fn(),
    };

    fakeStoryModel = {
      addStory: vi.fn(),
    };

    fakeAuthModel = {
      getToken: vi.fn().mockReturnValue('mock-token-secret'),
    };
  });

  it('should validate empty description', async () => {
    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: '',
      photoBlob: validPhoto,
      lat: '',
      lon: '',
    });

    expect(result).toBe(false);
    expect(fakeView.showError).toHaveBeenCalledWith('Deskripsi cerita tidak boleh kosong.');
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
  });

  it('should validate missing photo', async () => {
    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: 'Momen berharga di Dicoding Space.',
      photoBlob: null,
      lat: '',
      lon: '',
    });

    expect(result).toBe(false);
    expect(fakeView.showError).toHaveBeenCalledWith(expect.stringContaining('Foto cerita wajib'));
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
  });

  it('should reject photo exceeding 1 MB', async () => {
    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: 'Momen berharga.',
      photoBlob: oversizedPhoto,
      lat: '',
      lon: '',
    });

    expect(result).toBe(false);
    expect(fakeView.showError).toHaveBeenCalledWith(expect.stringContaining('1 MB'));
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
  });

  it('should validate latitude range (-90 to 90)', async () => {
    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: 'Momen berharga.',
      photoBlob: validPhoto,
      lat: '999',
      lon: '106.8456',
    });

    expect(result).toBe(false);
    expect(fakeView.showError).toHaveBeenCalledWith(expect.stringContaining('latitude tidak valid'));
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
  });

  it('should validate longitude range (-180 to 180)', async () => {
    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: 'Momen berharga.',
      photoBlob: validPhoto,
      lat: '-6.2088',
      lon: '-200',
    });

    expect(result).toBe(false);
    expect(fakeView.showError).toHaveBeenCalledWith(expect.stringContaining('longitude tidak valid'));
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
  });

  it('should submit successfully and redirect to home', async () => {
    fakeStoryModel.addStory.mockResolvedValue({ error: false, message: 'success' });

    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });

    const result = await presenter.submitDraftStory({
      description: 'Pemandangan indah saat bootcamp.',
      photoBlob: validPhoto,
      lat: '-6.2088',
      lon: '106.8456',
    });

    expect(result).toBe(true);
    expect(fakeStoryModel.addStory).toHaveBeenCalledWith({
      token: 'mock-token-secret',
      description: 'Pemandangan indah saat bootcamp.',
      photo: validPhoto,
      lat: -6.2088,
      lon: 106.8456,
    });
    expect(fakeView.showSuccess).toHaveBeenCalledWith(expect.stringContaining('berhasil dibagikan'));
    expect(fakeView.navigateToHome).toHaveBeenCalled();
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should divert to offline queue when injected networkStatus returns false', async () => {
    const fakeDatabase = {
      queueDraftStory: vi.fn().mockResolvedValue(999),
    };

    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
      database: fakeDatabase,
      networkStatus: () => false,
    });

    const result = await presenter.submitDraftStory({
      description: 'Cerita offline via custom networkStatus.',
      photoBlob: validPhoto,
      lat: '-6.2088',
      lon: '106.8456',
    });

    expect(result).toEqual({ success: true, isOfflineQueued: true });
    expect(fakeDatabase.queueDraftStory).toHaveBeenCalledWith({
      description: 'Cerita offline via custom networkStatus.',
      photo: validPhoto,
      lat: -6.2088,
      lon: 106.8456,
    });
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
    expect(fakeView.showSuccess).toHaveBeenCalledWith(expect.stringContaining('Koneksi offline'));
    expect(fakeView.navigateToHome).toHaveBeenCalled();
  });
});
