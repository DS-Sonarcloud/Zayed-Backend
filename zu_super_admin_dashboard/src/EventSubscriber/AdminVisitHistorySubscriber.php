<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\EventSubscriber;

use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Controller\TitleResolverInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\zu_super_admin_dashboard\Service\AdminVisitHistoryService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Records admin page visits for the super-admin dashboard history.
 */
final class AdminVisitHistorySubscriber implements EventSubscriberInterface {

  /**
   * Routes that should not appear in visit history.
   *
   * @var list<string>
   */
  private const SKIP_ROUTES = [
    'zu_super_admin_dashboard.dashboard',
    'system.batch_page.html',
    'system.batch_page.json',
    'system.cron',
    'dblog.event',
    'view.ajax',
    'big_pipe.nojs',
  ];

  public function __construct(
    private readonly AccountProxyInterface $currentUser,
    private readonly AdminVisitHistoryService $visitHistory,
    private readonly RouteMatchInterface $routeMatch,
    private readonly TitleResolverInterface $titleResolver,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => ['onRequest', 30],
    ];
  }

  public function onRequest(RequestEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }

    $request = $event->getRequest();
    if (!$this->currentUser->isAuthenticated()) {
      return;
    }

    if (!$this->currentUser->hasPermission('access administration pages')) {
      return;
    }

    if ($request->isXmlHttpRequest()) {
      return;
    }

    $route_name = $this->routeMatch->getRouteName();
    if ($route_name === NULL || $route_name === '' || in_array($route_name, self::SKIP_ROUTES, TRUE)) {
      return;
    }

    if (str_contains($route_name, '.ajax') || str_ends_with($route_name, '_ajax')) {
      return;
    }

    $path = $request->getPathInfo() ?? '';
    if (!$this->isAdminPath($path)) {
      return;
    }

    $route = $this->routeMatch->getRouteObject();
    if ($route === NULL) {
      return;
    }

    $requirements = $route->getRequirements();
    if (isset($requirements['_format']) && !str_contains((string) $requirements['_format'], 'html')) {
      return;
    }

    $title = $this->resolveTitle($request, $route);
    if ($title === '') {
      return;
    }

    $this->visitHistory->record($path, $title, $route_name);
  }

  private function isAdminPath(string $path): bool {
    return (bool) preg_match('#/(admin)(/|$)#', $path);
  }

  private function resolveTitle(Request $request, object $route): string {
    try {
      $title = $this->titleResolver->getTitle($request, $route);
    }
    catch (\Exception) {
      return '';
    }

    if ($title instanceof MarkupInterface) {
      return trim(strip_tags((string) $title));
    }

    return trim(strip_tags((string) $title));
  }

}
