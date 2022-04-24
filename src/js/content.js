import { ExportImportSection } from './components/ExportImportSection.js';
import { ExtensionSettingsSection } from './components/ExtensionSettingsSection.js';

import {
  DATASET,
  ARTIFACT_SET_NAMES,
  ARTIFACT_DATA,
  loadArtifactData,
  saveToLocalStorage,
} from './dataManager.js';

import {
  loadAndCreateAllArtifacts,
  loadArtifact,
} from './artifactRenderer.js';

const main = async function () {
  await loadArtifactData();
  console.log(DATASET);
  console.log(ARTIFACT_DATA);

  // do not create the slots or the hiding buttons if artifacts are disabled
  if ( ARTIFACT_DATA['__DISABLED'] === false ) {
    loadAndCreateAllArtifacts();
  }

  // mutation observer cannot track elements created before
  // it's been initialized so the function must be called once on startup
  const OPTIONS_MENU = document.querySelector('.PlannerOptions_options__t3nvI');
  const OPTIONS_SECTION_LIST = OPTIONS_MENU.querySelector('.PlannerOptions_optionContent__2_jPR');
  const SETTINGS_SECTION = ExtensionSettingsSection();
  // last element is the More Options button
  OPTIONS_SECTION_LIST.insertBefore(SETTINGS_SECTION, OPTIONS_SECTION_LIST.lastElementChild);

  // MutationObserver is used to monitor when
  // a) the user opens the options window
  // b) the quick menu is created on screens wide enough (laptop and wider)
  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  const observer = new MutationObserver( mutationList => {
    mutationList.forEach( mutation => {
      mutation.addedNodes.forEach( addedNode => {
        // options window
        // console.log(addedNode);
        // console.log(addedNode.classList);
        if ( addedNode.id === 'options' ) {
          const options_window = addedNode;
          options_window
            .querySelector('.PlannerOptions_content__kBajJ')
            .appendChild(ExportImportSection());
        }
        // quick menu
        else if ( addedNode.classList.contains('PlannerOptions_options__t3nvI')) {
          // OPTIONS_MENU element does not exist until
          // quick menu is created thus it has to be (re)defined here
          const OPTIONS_MENU = document.querySelector('.PlannerOptions_options__t3nvI');
          const OPTIONS_SECTION_LIST = OPTIONS_MENU.querySelector('.PlannerOptions_optionContent__2_jPR');
          const SETTINGS_SECTION = ExtensionSettingsSection();
          // last element is the More Options button
          OPTIONS_SECTION_LIST.insertBefore(SETTINGS_SECTION, OPTIONS_SECTION_LIST.lastElementChild);
        }
      });
    });
  });

  const config = { subtree: false, childList: true };
  // options window, opened manually
  observer.observe(document.querySelector('body'), config);
  // quick menu, accessible only on screens wide enough
  observer.observe(document.querySelector('.Farm_sideBar__yXGVR'), config);
};

// waits until the character list has loaded and then executes the main function
// called from content_script.js
export function waitForPageToLoad () {
  const waitForCharacterList = setInterval(function () {
    if ( document.querySelector('.Farm_itemList__EgRFB > div') ) {
      clearInterval(waitForCharacterList);
      console.log("Character list loaded!");

      main();
    }
  }, 100);
}
