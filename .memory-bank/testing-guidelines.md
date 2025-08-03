# Testing Guidelines for AI Chat Projects

## Proper Testing Methodology

### 1. Backend vs Frontend Testing
- **Backend Testing**: API functionality, tool execution, streaming
- **Frontend Testing**: UI display, user interaction, visual feedback
- **End-to-End Testing**: Complete user journey with visual verification

### 2. Testing Tools Functionality
When testing tools in AI chat applications:

1. **Verify API execution** (logs show tool calls)
2. **Check UI rendering** (user sees progress/results)
3. **Test user experience** (intuitive interaction)
4. **Visual confirmation** (screenshots/recordings)

### 3. Common UI Issues with AI SDK v5
- Message parts not rendering correctly
- Tool calls/results not displayed
- Streaming updates not reflected in UI
- Missing component imports/implementations

### 4. Testing Checklist
- [ ] Tool executes on backend (check logs)
- [ ] Tool results returned in response
- [ ] UI components handle tool-call parts
- [ ] UI components handle tool-result parts
- [ ] Progress indicators work during execution
- [ ] Final results displayed to user
- [ ] User can interact with results

### 5. Debugging Steps
1. Check server logs for tool execution
2. Check browser console for UI errors
3. Inspect message structure in React DevTools
4. Verify component rendering logic
5. Test with browser screenshots/recordings

### 6. Success Criteria
- User can request tool usage
- User sees real-time progress (if applicable)
- User sees final results
- UI is intuitive and responsive
- Error states are handled gracefully

## Current Project Issues
- Tools execute successfully on backend
- UI doesn't display tool results to user
- Need to fix message rendering components