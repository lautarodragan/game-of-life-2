export const withPerformance = (fn, updateFrequency, updateCallback) => {
  let performanceSampleCount = 0
  let performanceAverage = 0

  return () => {
    const start = performance.now()

    fn()

    performanceSampleCount++
    const measure = performance.now() - start

    if (performanceSampleCount > 1)
      performanceAverage = performanceAverage * (performanceSampleCount - 1) / performanceSampleCount + measure / performanceSampleCount
    else
      performanceAverage = measure

    if (performanceSampleCount % updateFrequency === 0)
      updateCallback(performanceAverage)
  }
}
