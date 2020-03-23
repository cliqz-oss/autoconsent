## Cliqz Autoconsent

This is a library of rules for navigating through common consent popups on the web. These rules
can be run in a Firefox webextension, or in a puppeteer orchestrated headless browser. Using
these rules, opt-in and opt-out options can be selected automatically, without requiring
user-input.

This library is primarily used by the [cliqz browser](https://cliqz.com) in order to automate user-consent, and make a cleaner browsing experience.

### Rules

The library's functionality is implemented a set of rules that define how to manage consent on
a subset of sites. These generally correspond to specific Consent Management Providers (CMPs)
that are installed on multiple sites. Each CMP ruleset defines:

 * If the site is using that CMP
 * If a popup is displayed
 * Steps to specify an 'opt-in' or 'opt-out' consent for the CMP.
 * Optionally, a test if the consent was correctly applied.

There are currently three ways of implementing a CMP:
 
 1. As a [JSON ruleset](./rules/autoconsent/), intepreted by the `AutoConsent` class. 
 1. As a class implementing the `AutoCMP` interface. This enables more complex logic than the linear AutoConsent
 rulesets allow.
 3. As a [Consent-O-Matic](https://github.com/cavi-au/Consent-O-Matic) rule. The `ConsentOMaticCMP` class implements
 compability with rules written for the Consent-O-Matic extension.

### License

MPLv3.
