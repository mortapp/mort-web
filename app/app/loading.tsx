import { SkeletonStats, SkeletonGrid, SkeletonLine } from '@/components/ui'

export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading your workspace" aria-busy="true">
      <div className="page-header">
        <div className="page-header-text">
          <SkeletonLine width={120} />
          <div style={{ height: 8 }} />
          <SkeletonLine width={220} />
        </div>
      </div>
      <SkeletonStats />
      <SkeletonGrid count={6} cols="three" />
    </div>
  )
}
