
interface SparklineChartProps {
  data: number[];
  positive: boolean;
  height?: number;
  width?: number;
  showAxis?: boolean;
  showLabels?: boolean;
  labelCount?: number;
}

const SparklineChart = ({
  data,
  positive,
  height = 40,
  width = 100,
  showAxis = false,
  showLabels = false,
  labelCount = 6
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

  // Generate points for data markers
  const generatePoints = () => {
    const points = [];
    
    // Always show first and last points
    points.push({
      x: getX(0),
      y: getY(data[0]),
      value: data[0]
    });
    
    points.push({
      x: getX(data.length - 1),
      y: getY(data[data.length - 1]),
      value: data[data.length - 1]
    });
    
    // Show additional points based on labelCount
    if (data.length > 2 && labelCount > 2) {
      const step = Math.max(1, Math.floor(data.length / (labelCount - 1)));
      
      // Add intermediate points at regular intervals
      for (let i = step; i < data.length - 1; i += step) {
        if (points.length < labelCount - 1) { // Ensure we don't add too many points
          points.push({
            x: getX(i),
            y: getY(data[i]),
            value: data[i]
          });
        }
      }
      
      // Always add min and max points if they're not already included
      const minIndex = data.indexOf(min);
      const maxIndex = data.indexOf(max);
      
      // Only add min/max if they're not the first or last point
      if (minIndex !== 0 && minIndex !== data.length - 1) {
        // Check if this point or a nearby point is already included
        if (!points.some(p => Math.abs(p.x - getX(minIndex)) < width / (labelCount * 2))) {
          points.push({
            x: getX(minIndex),
            y: getY(min),
            value: min
          });
        }
      }
      
      if (maxIndex !== 0 && maxIndex !== data.length - 1) {
        // Check if this point or a nearby point is already included
        if (!points.some(p => Math.abs(p.x - getX(maxIndex)) < width / (labelCount * 2))) {
          points.push({
            x: getX(maxIndex),
            y: getY(max),
            value: max
          });
        }
      }
    }
    
    // Sort points by x-coordinate for consistent rendering
    return points.sort((a, b) => a.x - b.x);
  };
  
  // Format number for display
  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else if (Math.abs(num) >= 10) {
      return num.toFixed(1);
    } else {
      return num.toFixed(2);
    }
  };
  
  const points = showLabels ? generatePoints() : [];
  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"} />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </linearGradient>
      </defs>
      
      {/* Area under the line */}
      <path
        d={`${generatePath()} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
        opacity="0.5"
      />
      
      {/* X and Y axes */}
      {showAxis && (
        <>
          <line 
            x1="0" 
            y1={height} 
            x2={width} 
            y2={height} 
            stroke="currentColor" 
            strokeOpacity="0.2" 
            strokeWidth="0.5" 
          />
          <line 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={height} 
            stroke="currentColor" 
            strokeOpacity="0.2" 
            strokeWidth="0.5" 
          />
        </>
      )}
      
      {/* Main line */}
      <path
        d={generatePath()}
        fill="none"
        strokeWidth="1.5"
        stroke={positive ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"}
        className="sparkline"
      />
      
      {/* Data points */}
      {showLabels && points.map((point, i) => (
        <g key={i}>
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="2" 
            fill={positive ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"} 
            stroke="white"
            strokeWidth="0.5"
          />
          <text 
            x={point.x} 
            y={point.y - 5} 
            fontSize="6" 
            textAnchor="middle" 
            fill="currentColor"
            fontWeight="medium"
          >
            {formatNumber(point.value)}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default SparklineChart;
