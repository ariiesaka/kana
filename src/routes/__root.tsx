import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({ meta: [{ title: 'kana' }] }),
  component: Root,
})

function Root() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
