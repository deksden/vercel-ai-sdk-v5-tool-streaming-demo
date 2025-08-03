import { test, expect } from '@playwright/test';
import { ChatPage } from '../page-objects/ChatPage';
import { ToolProgressComponent } from '../page-objects/ToolProgressComponent';
import { TEST_MESSAGES, TEST_TIMEOUTS } from '../utils/test-data';

test.describe('AI Tool Progress Streaming', () => {
  let chatPage: ChatPage;
  let toolProgress: ToolProgressComponent;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    toolProgress = new ToolProgressComponent(page);
    
    // Navigate to the app
    await chatPage.navigate();
  });

  test('should display welcome screen correctly', async () => {
    await chatPage.verifyWelcomeScreen();
    await chatPage.verifyChatInputEnabled();
  });

  test('core streaming functionality - tool progress works end-to-end', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Tool progress')) {
        console.log('PAGE LOG:', msg.text());
      }
    });

    // Step 1: Send message that triggers tool
    console.log('Step 1: Sending message to trigger tool...');
    await chatPage.sendMessage(TEST_MESSAGES.ANALYTICS_DASHBOARD);

    // Step 2: Wait for tool progress to appear
    console.log('Step 2: Waiting for tool progress to start...');
    await toolProgress.waitForProgressToStart(TEST_TIMEOUTS.PROGRESS_START);
    
    // Step 3: Verify initial state
    console.log('Step 3: Verifying initial progress state...');
    await toolProgress.verifyInitialState();
    await toolProgress.verifyMinimumSteps(3);
    
    // Step 4: Wait for progress to enter running state
    console.log('Step 4: Waiting for running state...');
    await toolProgress.waitForRunningState(TEST_TIMEOUTS.PROGRESS_RUNNING);
    
    // Step 5: Verify progress details
    console.log('Step 5: Verifying progress details...');
    await toolProgress.verifyProjectDetails('analytics', 'medium');
    
    // Step 6: Wait for completion
    console.log('Step 6: Waiting for completion...');
    await toolProgress.waitForCompletion(TEST_TIMEOUTS.PROGRESS_COMPLETE);
    
    // Step 7: Verify final state
    console.log('Step 7: Verifying final state...');
    await toolProgress.verifyProgressComplete();
    
    const executionTime = await toolProgress.getExecutionTime();
    const totalSteps = await toolProgress.getTotalStepsCount();
    const completedSteps = await toolProgress.getCompletedStepsCount();
    
    console.log(`Test completed successfully!`);
    console.log(`- Execution time: ${executionTime}s`);
    console.log(`- Steps completed: ${completedSteps}/${totalSteps}`);
    
    // Full assertions
    expect(executionTime).toBeGreaterThan(0);
    expect(executionTime).toBeLessThan(120); // Should complete within 2 minutes
    expect(totalSteps).toBeGreaterThanOrEqual(3);
    expect(completedSteps).toBeGreaterThan(0);
  });

  test('should handle suggestion clicks', async () => {
    // Test clicking on medium complexity suggestion
    await chatPage.clickSuggestion('medium');
    
    // Wait for tool progress to start
    await toolProgress.waitForProgressToStart(TEST_TIMEOUTS.PROGRESS_START);
    await toolProgress.verifyInitialState();
  });

  test('should show progress for different complexity levels', async () => {
    // Test simple project with specific name
    await chatPage.sendMessage(TEST_MESSAGES.SIMPLE_APP);
    await toolProgress.waitForProgressToStart(TEST_TIMEOUTS.PROGRESS_START);
    await toolProgress.verifyProjectDetails('portfolio', 'simple');
  });
});