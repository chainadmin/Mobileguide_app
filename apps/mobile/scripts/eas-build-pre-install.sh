#!/bin/bash
set -e

echo "=== EAS Build Pre-Install Hook ==="
echo "Patching React Native cmake configuration to allow deprecation warnings..."

# Find and patch the cmake configuration files
find "$EAS_BUILD_WORKINGDIR/node_modules" -name "CMakeLists.txt" -exec grep -l "Werror" {} \; 2>/dev/null | while read file; do
  echo "Patching: $file"
  sed -i 's/-Werror/-Werror -Wno-error=deprecated-declarations/g' "$file"
done

# Also patch any cmake files in react-native
RN_CMAKE_DIR="$EAS_BUILD_WORKINGDIR/node_modules/react-native/ReactAndroid/cmake-utils"
if [ -d "$RN_CMAKE_DIR" ]; then
  find "$RN_CMAKE_DIR" -name "*.cmake" -exec grep -l "Werror" {} \; 2>/dev/null | while read file; do
    echo "Patching: $file"
    sed -i 's/-Werror/-Werror -Wno-error=deprecated-declarations/g' "$file"
  done
fi

echo "=== Patch complete ==="
