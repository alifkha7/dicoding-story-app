import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import StoryDetailPage from '../pages/stories/story-detail-page';
import AddStoryPage from '../pages/stories/add-story-page';
import FavoritesPage from '../pages/favorites/favorites-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories/:id': new StoryDetailPage(),
  '/add': new AddStoryPage(),
  '/favorites': new FavoritesPage(),
};

export default routes;
