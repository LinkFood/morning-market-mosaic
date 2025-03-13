
# Fed Dashboard Testing Strategy

## Overview

The Fed Dashboard implements a comprehensive testing strategy to ensure data accuracy, consistent visualization, and reliable user experience. This document outlines the testing approach, tools, and best practices.

## Testing Pyramid

Our testing strategy follows the testing pyramid approach:

1. **Unit Tests**: Testing individual functions and components in isolation
2. **Integration Tests**: Testing how components work together
3. **Visual Regression Tests**: Ensuring UI consistency
4. **End-to-End Tests**: Testing complete user flows

## Unit Testing

Unit tests focus on the smallest testable parts of the application, particularly:

- **Utility Functions**: Data processing, formatting, and calculation functions
- **Hooks**: Custom React hooks that manage state or side effects
- **Small Components**: Individual UI components with specific responsibilities

### Example: Testing Formatting Functions

```javascript
// Sample unit test for formatting utility
test('formats rate values correctly', () => {
  const value = 4.25;
  const result = formatChartValue(value, 'value', 'Interest Rate');
  expect(result).toBe('4.25%');
});
```

## Component Testing

Component tests verify that UI components render correctly and respond appropriately to user interactions:

- **Snapshot Testing**: Ensures UI appearance remains consistent
- **Interaction Testing**: Simulates user interactions and verifies correct behavior
- **State Testing**: Checks component state changes correctly

### Example: Testing an Indicator Card Component

```javascript
// Sample component test
test('displays the change with correct sign', () => {
  const { getByText } = render(<InflationCard indicator={mockIndicator} />);
  expect(getByText('-0.2%')).toBeInTheDocument();
});
```

## Integration Testing

Integration tests ensure different parts of the application work together:

- **Data Flow Testing**: Verifies data flows correctly between components
- **API Integration**: Tests the interaction with the FRED API
- **Context Testing**: Verifies context providers work correctly

## Visual Regression Testing

Visual regression tests capture screenshots of components and compare them against baselines to detect unwanted visual changes:

- Uses snapshot testing for UI consistency
- Helps catch unintended visual side effects of code changes

## End-to-End Testing

End-to-end tests simulate real user scenarios:

- **User Flows**: Complete user journeys through the application
- **Browser Compatibility**: Testing across different browsers
- **Performance Testing**: Ensuring acceptable loading times and responsiveness

## Testing Tools

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing React components
- **Mock Service Worker**: API mocking

## Best Practices

1. **Test in Isolation**: Minimize dependencies in unit tests
2. **Use Test Doubles**: Use mocks and stubs for external dependencies
3. **Descriptive Test Names**: Tests should clearly describe what they're testing
4. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
5. **Test Coverage**: Aim for high coverage of critical functionality

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run tests in watch mode during development
npm test -- --watch
```

## Continuous Integration

Tests are run automatically as part of the CI/CD pipeline:

- Tests run on every pull request
- Code coverage reports are generated
- Visual regression test results are stored for comparison
