
type Tab = {
  url: string
}

type BrowserTabs = {
  get(tabId: number): Promise<Tab>
  update(tabId: number, options: any): Promise<void>
}

export type Browser = {
  tabs: BrowserTabs,
}

export interface TabActor {
  frame?: {
    id: number
    url: string
  }
  id: number
  url: string
  elementExists(selector: string, frameId?: number): Promise<boolean>
  clickElement(selector: string, frameId?: number): Promise<boolean>
  clickElements(selector: string, frameId?: number): Promise<boolean>
  elementsAreVisible(selector: string, check?: 'all' | 'any' | 'none', frameId?: number): Promise<boolean>
  getAttribute(selector: string, attribute: string, frameId?: number): Promise<string>
  eval(script: string, frameId?: number): Promise<boolean>
  waitForElement(selector: string, timeout: number, frameId?: number): Promise<boolean>
  waitForThenClick(selector: string, timeout: number, frameId?: number): Promise<boolean>
  hideElements(selectors: string[], frameId?: number): Promise<boolean>
  sendKeyEvent(selector: string, eventType, keyCode, charCode?: number, frameId?: number): Promise<boolean>
  goto(url: string): Promise<void>
  wait(ms: number): Promise<true>

  // Consent-O-Matic methods
  find(options, multiple?: false): Promise<FindResult>
  find(options, multiple: true): Promise<FindResult[]>
}

export type MessageSender<ResultType = any> = (tabId: number, message: any, options?: { frameId: number }) => Promise<ResultType>;

export interface AutoCMP {
  name: string
  detectCmp(tab: TabActor): Promise<boolean>
  detectPopup(tab: TabActor): Promise<boolean>
  optOut(tab:TabActor): Promise<boolean>
  optIn(tab: TabActor): Promise<boolean>
  openCmp(tab: TabActor): Promise<boolean>
  test(tab: TabActor): Promise<boolean>
  detectFrame(tab: TabActor, frame: { url: string }): boolean
}

type FindResult = {
  parent?: any
  target?: {
    checked: boolean
  }
}