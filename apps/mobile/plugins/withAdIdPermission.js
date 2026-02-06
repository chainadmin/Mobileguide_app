const { withAndroidManifest, withAppBuildGradle } = require('expo/config-plugins');

const withAdIdPermission = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.$) {
      manifest.$ = {};
    }
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const adIdPermission = 'com.google.android.gms.permission.AD_ID';
    const adServicesAdId = 'android.permission.ACCESS_ADSERVICES_AD_ID';
    const adServicesAttribution = 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION';

    const permissionsToAdd = [
      { name: adIdPermission, toolsNode: 'replace' },
      { name: adServicesAdId, toolsNode: 'replace' },
      { name: adServicesAttribution, toolsNode: 'replace' },
    ];

    for (const perm of permissionsToAdd) {
      const existingIndex = manifest['uses-permission'].findIndex(
        (p) => p.$?.['android:name'] === perm.name
      );

      const entry = {
        $: {
          'android:name': perm.name,
          'tools:node': perm.toolsNode,
        },
      };

      if (existingIndex >= 0) {
        manifest['uses-permission'][existingIndex] = entry;
      } else {
        manifest['uses-permission'].push(entry);
      }
    }

    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const contents = config.modResults.contents;
      const adIdSnippet = `
// Force AD_ID permission in final merged manifest
android.defaultConfig.manifestPlaceholders += [
    adIdPermission: "com.google.android.gms.permission.AD_ID"
]
`;
      if (!contents.includes('adIdPermission')) {
        config.modResults.contents = contents + '\n' + adIdSnippet;
      }
    }
    return config;
  });

  return config;
};

module.exports = withAdIdPermission;
