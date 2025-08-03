import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChatPage extends BasePage {
  // Locators
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messagesList: Locator;
  readonly welcomeCard: Locator;
  readonly suggestionMedium: Locator;
  readonly suggestionComplex: Locator;
  readonly suggestionSimple: Locator;

  constructor(page: Page) {
    super(page);
    
    this.chatInput = this.getByTestId('chat-input');
    this.sendButton = this.getByTestId('send-button');
    this.messagesList = this.getByTestId('messages-list');
    this.welcomeCard = this.getByTestId('welcome-card');
    this.suggestionMedium = this.getByTestId('suggestion-medium');
    this.suggestionComplex = this.getByTestId('suggestion-complex');
    this.suggestionSimple = this.getByTestId('suggestion-simple');
  }

  async navigate() {
    await super.navigate('/');
    await this.waitForPageLoad();
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.verifySendButtonEnabled(); // Verify button becomes enabled after filling input
    await this.sendButton.click();
  }

  async clickSuggestion(type: 'medium' | 'complex' | 'simple') {
    const suggestion = type === 'medium' ? this.suggestionMedium : 
                     type === 'complex' ? this.suggestionComplex : 
                     this.suggestionSimple;
    
    await suggestion.click();
  }

  async waitForResponse(timeout: number = 30000) {
    // Wait for at least one message to appear
    await this.page.waitForFunction(() => {
      const messagesList = document.querySelector('[data-testid="messages-list"]');
      return messagesList && messagesList.children.length > 0;
    }, { timeout });
  }

  async getMessages() {
    return await this.page.locator('[data-testid^="message-"]').all();
  }

  async getLastMessage() {
    const messages = await this.getMessages();
    return messages[messages.length - 1];
  }

  async verifyWelcomeScreen() {
    await expect(this.welcomeCard).toBeVisible();
    await expect(this.suggestionMedium).toBeVisible();
    await expect(this.suggestionComplex).toBeVisible();
    await expect(this.suggestionSimple).toBeVisible();
  }

  async verifyChatInputEnabled() {
    await expect(this.chatInput).toBeEnabled();
    // Send button is disabled when input is empty - this is expected behavior
  }

  async verifySendButtonEnabled() {
    await expect(this.sendButton).toBeEnabled();
  }
}