# ReviewRadar
# Team TypeScript Standards

## Our Project: ReviewRadar
Brief description: A reviewing website where users can get trustworthy advice from eachother.

## Shared Type Definitions:
### Core Data Models:
- User: { id: string, name: string, email: string }
- [Add your project-specific data types]

### UI Component Props:
- Button variants: 'primary' | 'secondary' | 'danger'
- [Add component prop types you'll need]

## Naming Conventions:
- Interfaces: PascalCase (UserProfile, ButtonProps)
- Types: PascalCase (UserRole, Status)
- Union Types: Descriptive names (UserRole, not just Role)

## File Organization:
- `/types/index.ts` - Shared types across components
- Component files include component-specific props
- Keep related types together

## Union Types We'll Use:
(Based on your project features)
- [List 3-5 union types your project will need]
- Example: UserRole: 'admin' | 'user' | 'guest'

## Team Development Workflow:
- Create types before components
- Review TypeScript changes in pull requests
- No `any` without team discussion
- Test TypeScript changes locally first

## This Week's Goals:
- [ ] Set up shared types file
- [ ] Define core data models
- [ ] Establish component prop patterns
- [ ] Practice today's TypeScript enhancements