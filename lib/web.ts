import Tab from './web/tab';
import handleContentMessage from './web/content';
import { rules } from './index';
import { Browser, MessageSender } from './types';

export * from './index';
export {
  Tab,
  handleContentMessage,
}

async function detectDialog(tab, retries) {
  const detect = await Promise.all(rules.map(r => r.detectCmp(tab)));
  const found = detect.findIndex(r => r);
  if (found === -1 && retries > 0) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = detectDialog(tab, retries - 1);
        resolve(result);
      }, 1000);
    });
  }
  return found > -1 ? rules[found] : null;
}

class TabConsent {
  tab: any
  url: string
  checked: Promise<any>
  rule: any

  constructor(tab, url, ruleCheckPromise) {
    this.tab = tab;
    this.url = url;
    this.checked = ruleCheckPromise;
    ruleCheckPromise.then(rule => this.rule = rule);
  }

  getCMPName() {
    if (this.rule) {
      return this.rule.name;
    }
    return null;
  }

  async isPopupOpen() {
    return await this.rule.detectPopup(this.tab) || await new Promise((resolve) => {
      setTimeout(async () => resolve(await this.rule.detectPopup(this.tab)), 1000);
    });
  }

  async doOptOut() {
    return this.rule.optOut(this.tab);
  }

  async doOptIn() {
    return this.rule.optIn(this.tab);
  }

  hasTest() {
    return !!this.rule.test
  }

  async testOptOutWorked() {
    return this.rule.test(this.tab);
  }

  async applyCosmetics(selectors) {
    const hidden = await this.tab.hideElements(selectors);
    return hidden;
  }
}

export default class AutoConsent {
  consentFrames: Map<number, any> = new Map()
  tabCmps: Map<number, TabConsent> = new Map()

  constructor(protected browser: Browser, protected sendContentMessage: MessageSender) {
    this.sendContentMessage = sendContentMessage;
  }

  createTab(tabId: number, url: string) {
    return new Tab(tabId,
      url,
      this.consentFrames.get(tabId),
      this.sendContentMessage,
      this.browser);
  }

  async checkTab(tabId: number) {
    const tabInfo = await this.browser.tabs.get(tabId);
    const pageUrl = new URL(tabInfo.url);
    if (!this.tabCmps.has(tabId) || this.tabCmps.get(tabId).url !== pageUrl.href) {
      const tab = this.createTab(tabId, pageUrl.href);
      const consent = new TabConsent(tab, pageUrl, detectDialog(tab, 5));
      this.tabCmps.set(tabId, consent);
      // check tabs
      consent.checked.then((rule) => {
        if (this.consentFrames.has(tabId)) {
          const frame = this.consentFrames.get(tabId);
          if (frame.type === rule.name) {
            consent.tab.frame = frame;
          }
        }
      });
    }

    return this.tabCmps.get(tabId);
  }

  removeTab(tabId: number) {
    this.tabCmps.delete(tabId);
  }

  onFrame({ tabId, url, frameId }) {
    // ignore main frames
    if (frameId === 0) {
      return;
    }
    try {
      const frame = {
        id: frameId,
        url: url,
      };
      const tab = this.createTab(tabId, url);
      const frameMatch = rules.findIndex(r => r.detectFrame(tab, frame));
      if (frameMatch > -1) {
        this.consentFrames.set(tabId, {
          type: rules[frameMatch].name,
          url,
          id: frameId,
        });
        if (this.tabCmps.has(tabId)) {
          this.tabCmps.get(tabId).tab.frame = this.consentFrames.get(tabId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

}
