export const withPerformance = (fn) => {
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

    if (performanceSampleCount % 10 === 0)
      document.title = `Avg: ${Math.round(performanceAverage)}`
    // console.log(`This run: ${Math.round(measure)}`, `Avg: ${Math.round(performanceAverage)}`)
  }
}
