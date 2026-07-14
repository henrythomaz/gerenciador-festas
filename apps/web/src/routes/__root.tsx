import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: () => <div>Página não encontrada</div>,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
