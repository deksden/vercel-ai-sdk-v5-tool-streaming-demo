import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ToolProgressComponent extends BasePage {
  // Locators
  readonly progressContainer: Locator;
  readonly progressHeader: Locator;
  readonly statusIcon: Locator;
  readonly statusText: Locator;
  readonly progressMetadata: Locator;
  readonly progressSteps: Locator;
  readonly executionTime: Locator;

  constructor(page: Page) {
    super(page);
    
    this.progressContainer = this.getByTestId('tool-progress');
    this.progressHeader = this.getByTestId('tool-progress-header');
    this.statusIcon = this.getByTestId('status-icon');
    this.statusText = this.getByTestId('status-text');
    this.progressMetadata = this.getByTestId('progress-metadata');
    this.progressSteps = this.getByTestId('progress-steps');
    this.executionTime = this.getByTestId('execution-time');
  }

  async waitForProgressToStart(timeout: number = 15000) {
    console.log('Waiting for tool progress to start...');
    await this.progressContainer.waitFor({ state: 'visible', timeout });
    console.log('Tool progress container is visible');
  }

  async verifyInitialState() {
    await expect(this.progressContainer).toBeVisible();
    await expect(this.statusText).toBeVisible();
    await expect(this.progressSteps).toBeVisible();
  }

  async waitForRunningState(timeout: number = 30000) {
    console.log('Waiting for progress to enter running state...');
    
    // Simply wait for multiple steps to be visible - this indicates progress is running
    await this.page.waitForFunction(() => {
      const steps = document.querySelectorAll('[data-testid^="progress-step-"]');
      return steps.length >= 3; // At least 3 progress steps should be visible
    }, { timeout });
    
    console.log('Found multiple progress steps - progress is running');
  }

  async waitForCompletion(timeout: number = 60000) {
    console.log('Waiting for tool progress to complete...');
    
    // Wait for status text to indicate completion
    await this.page.waitForFunction(() => {
      const statusText = document.querySelector('[data-testid="status-text"]');
      return statusText && (
        statusText.textContent?.includes('created') ||
        statusText.textContent?.includes('completed') ||
        statusText.textContent?.includes('создан')
      );
    }, { timeout });
    
    console.log('Tool progress completed');
  }

  async getProgressSteps() {
    return await this.page.locator('[data-testid^="progress-step-"]').all();
  }

  async getCompletedStepsCount() {
    const steps = await this.getProgressSteps();
    let completedCount = 0;
    
    for (const step of steps) {
      const icon = step.locator('[data-testid^="step-icon-"]');
      const hasCheckIcon = await icon.locator('svg').count() > 0;
      if (hasCheckIcon) {
        completedCount++;
      }
    }
    
    return completedCount;
  }

  async getTotalStepsCount() {
    const steps = await this.getProgressSteps();
    return steps.length;
  }

  async getExecutionTime() {
    if (await this.executionTime.isVisible()) {
      const timeText = await this.executionTime.textContent();
      return timeText ? parseFloat(timeText.replace('s', '')) : 0;
    }
    return 0;
  }

  async verifyMinimumSteps(minSteps: number = 3) {
    const totalSteps = await this.getTotalStepsCount();
    expect(totalSteps).toBeGreaterThanOrEqual(minSteps);
  }

  async verifyProgressComplete() {
    await expect(this.executionTime).toBeVisible();
    const execTime = await this.getExecutionTime();
    expect(execTime).toBeGreaterThan(0);
  }

  async getStatusText() {
    return await this.statusText.textContent();
  }

  async verifyProjectDetails(projectName?: string, complexity?: string) {
    const statusText = await this.getStatusText();
    
    if (projectName) {
      expect(statusText?.toLowerCase()).toContain(projectName.toLowerCase());
    }
    
    if (complexity) {
      const metadataText = await this.progressMetadata.textContent();
      expect(metadataText?.toLowerCase()).toContain(complexity.toLowerCase());
    }
  }
}