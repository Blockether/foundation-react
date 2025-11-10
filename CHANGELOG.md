# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflows for automated CI/CD
- Automated NPM publishing on tag releases
- Bundle size monitoring for pull requests
- Comprehensive testing across Node.js versions

### Changed
- Enhanced build process with better artifact management
- Improved TypeScript configuration for library distribution

### Fixed
- Fixed datasource loading state synchronization issues
- Resolved race conditions in batch loading operations
- Corrected premature 'loaded' status indicators

## [1.0.0] - 2024-11-10

### Added
- Initial release of @blockether/foundation-react
- React-based SQL Cockpit component with Monaco Editor integration
- DuckDB-WASM support for browser-based SQL execution
- Professional toolbar with syntax highlighting and formatted results
- Data source management (CSV, Parquet, JSON support)
- Analytical query capabilities
- Storybook documentation and component examples
- TypeScript definitions with strict mode enabled
- TailwindCSS styling with shadcn/ui components
- Lucide React icons integration

### Features
- SQL query execution with real-time results
- Data visualization with recharts integration
- Export functionality for query results
- Saved queries management
- Error handling and validation
- Responsive design optimized for desktop browsers

### Technical Stack
- React 18+ with TypeScript
- Vite build system
- DuckDB-WASM for in-browser SQL
- Monaco Editor for code editing
- TailwindCSS with shadcn/ui
- Storybook for component documentation