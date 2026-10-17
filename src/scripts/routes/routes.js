import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import StoryDetailPage from '../pages/stories/story-detail-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories/:id': new StoryDetailPage(),
};

export default routes;
