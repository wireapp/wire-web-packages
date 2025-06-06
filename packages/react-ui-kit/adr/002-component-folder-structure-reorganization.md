# ADR: Component Folder Structure Reorganization

## Status

Accepted

## Context

The react-ui-kit package's component structure needed better organization to improve maintainability and developer experience. The previous structure had components scattered across different locations without clear categorization, making it difficult to:

1. Locate specific components
2. Determine where to place new components
3. Understand the relationships between components
4. Maintain consistent organization across the codebase

## Decision

We have reorganized all components into the following categories:

- **DataDisplay**: Components for displaying data (tables, lists, etc.)
- **Identity**: Components related to user identity and avatars
- **Inputs**: Form controls and input elements
- **Layout**: Structural components for page and content organization
- **Navigation**: Components for navigation and routing
- **Surface**: Container components, cards, modals, and overlay elements
- **Typography**: Text-related components
- **utils**: Utility components and helpers

This structure is inspired by Material UI's organization pattern, which has proven successful in large component libraries.

## Consequences

### Benefits

- **Clear Organization**: Each component has a logical home based on its purpose
- **Improved Discoverability**: Developers can easily find components based on their category
- **Consistent Structure**: New components can be added following clear guidelines
- **Better Maintainability**: Related components are grouped together, making updates and maintenance easier
- **Scalability**: The structure can accommodate future growth and new component additions
- **Industry Standard**: Following a well-established pattern from Material UI

### Potential Drawbacks

- **Learning Curve**: Team members need to learn the new organization system

### Implementation Notes

The reorganization has been completed and will be presented in the same PR as this ADR. The changes include:

- All components moved to their respective category folders
- All import statements updated across the codebase
- Documentation updated to reflect new structure
- Build process verified with new folder structure
- Component documentation updated to reflect new locations

## Updates

- Initial reorganization completed
- All components moved to their respective category folders
- Import paths updated throughout the codebase
