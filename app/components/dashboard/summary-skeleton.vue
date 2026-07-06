<template>
  <div class="flex flex-col gap-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SGCard v-for="i in 3" :key="`category-${i}`">
        <SGSkeleton class="h-4 w-20" />
        <SGSkeleton class="mt-3 h-7 w-16" />
        <SGSkeleton class="mt-2 h-3 w-24" />
        <SGSkeleton class="mt-4 h-2 w-full rounded-full" />
        <SGSkeleton class="mt-2 h-3 w-40" />
      </SGCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <SGCard v-for="i in 2" :key="`class-${i}`">
        <SGSkeleton class="h-5 w-48" />
        <SGSkeleton class="mt-3 h-7 w-16" />
        <SGSkeleton class="mt-2 h-3 w-24" />
        <SGSkeleton class="mt-4 h-2 w-full rounded-full" />
        <SGSkeleton class="mt-2 h-3 w-40" />
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div v-for="j in 2" :key="`detail-${j}`">
            <SGSkeleton class="h-3 w-16" />
            <SGSkeleton class="mt-1.5 h-3 w-10" />
          </div>
        </div>
      </SGCard>
    </div>

    <SGCard>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="i in 4" :key="`stat-${i}`">
          <SGSkeleton class="h-3 w-16" />
          <SGSkeleton class="mt-2 h-6 w-12" />
        </div>
      </div>
    </SGCard>
  </div>
</template>
