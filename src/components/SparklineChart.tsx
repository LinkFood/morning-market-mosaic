
interface SparklineChartProps {
  data: number[];
  positive: boolean;
  height?: number;
  width?: number;
}

const SparklineChart = ({
  data,
  positive,
  height = 40,
  width = 100
}: SparklineChartProps) => {
  if (!data || data.length === 0) {
    return <div className="h-full w-full bg-muted/30 rounded animate-pulse-light"></div>;
  }
  
  // Calculate the min and max values for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // Add padding to the top and bottom
  const paddingFactor = 0.1;
  const paddedMin = min - range * paddingFactor;
  const paddedMax = max + range * paddingFactor;
  const paddedRange = paddedMax - paddedMin;
  
  // Function to calculate Y position for a data point
  const getY = (value: number) => {
    // Invert the Y-axis (SVG 0,0 is top-left)
    return height - ((value - paddedMin) / paddedRange) * height;
  };
  
  // Function to calculate X position for a data point
  const getX = (index: number) => {
    return (index / (data.length - 1)) * width;
  };
  
  // Generate the path data
  const generatePath = () => {
    return data
      .map((value, index) => {
        const x = getX(index);
        const y = getY(value);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };
  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path
        d={generatePath()}
        className={`sparkline ${positive ? "sparkline-positive" : "sparkline-negative"}`}
      />
    </svg>
  );
};

export default SparklineChart;
