<?php
 
namespace Drupal\zu_rest_api\EventSubscriber;
 
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Url;
 
class UserLogoutSubscriber implements EventSubscriberInterface
{
 
  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents()
  {
    return [
      KernelEvents::RESPONSE => ['onResponse', -10],
    ];
  }
 
  /**
   * Redirects to the login page after logout.
   *
   * @param \Symfony\Component\HttpKernel\Event\ResponseEvent $event
   *   The response event.
   */
  public function onResponse(ResponseEvent $event)
  {
    if (\Drupal::routeMatch()->getRouteName() === 'user.logout') {
      $url = Url::fromRoute('user.login')->toString();
      $event->setResponse(new RedirectResponse($url));
    }
  }
 
}
 