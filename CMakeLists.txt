project(printha)
set(VERSION 1.0.0)
cmake_minimum_required(VERSION 2.8)

include(FindPkgConfig)
include(GNUInstallDirs)
include(InstallRequiredSystemLibraries)

# cairo
pkg_check_modules(CAIRO cairo)
INCLUDE_DIRECTORIES(${CAIRO_INCLUDE_DIRS})
LINK_DIRECTORIES(${CAIRO_LIBRARY_DIRS})
LINK_LIBRARIES(${CAIRO_LIBRARIES})

# freetype2
pkg_check_modules(FREETYPE2 freetype2)
INCLUDE_DIRECTORIES(${FREETYPE2_INCLUDE_DIRS})
LINK_DIRECTORIES(${FREETYPE2_LIBRARY_DIRS})
LINK_LIBRARIES(${FREETYPE2_LIBRARIES})

# harfbuzz
pkg_check_modules(HARFBUZZ harfbuzz)
INCLUDE_DIRECTORIES(${HARFBUZZ_INCLUDE_DIRS})
LINK_DIRECTORIES(${HARFBUZZ_LIBRARY_DIRS})
LINK_LIBRARIES(${HARFBUZZ_LIBRARIES})

# harfbuzz-icu
pkg_check_modules(HARFBUZZ_ICU harfbuzz-icu)
INCLUDE_DIRECTORIES(${HARFBUZZ_ICU_INCLUDE_DIRS})
LINK_DIRECTORIES(${HARFBUZZ_ICU_LIBRARY_DIRS})
LINK_LIBRARIES(${HARFBUZZ_ICU_LIBRARIES})

# fontconfig
pkg_check_modules(FONTCONFIG fontconfig)
INCLUDE_DIRECTORIES(${FONTCONFIG_INCLUDE_DIRS})
LINK_DIRECTORIES(${FONTCONFIG_LIBRARY_DIRS})
LINK_LIBRARIES(${FONTCONFIG_LIBRARIES})

set(CMAKE_C_FLAGS "-Wall")
set(CMAKE_CXX_FLAGS "-Wall -std=c++11")

ADD_CUSTOM_TARGET(debug
                    ${CMAKE_COMMAND} 
                      -DCMAKE_BUILD_TYPE:STRING=Debug ${PROJECT_SOURCE_DIR})
ADD_CUSTOM_TARGET(release
                    ${CMAKE_COMMAND}
                      -DCMAKE_BUILD_TYPE:STRING=Release ${PROJECT_SOURCE_DIR})

set(CMAKE_C_FLAGS_DEBUG "-O0 -g -DDEBUG")
set(CMAKE_CXX_FLAGS_DEBUG "-O0 -g -DDEBUG")
set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")
set(CMAKE_CXX_FLAGS_RELEASE "-O2 -DNDEBUG")

# Make sure to link to Harfbuzz's since it may be installed locally atm.
option(USE_LOCAL_HARFBUZZ "Use local harfbuzz instead of distro's" OFF)
if(USE_LOCAL_HARFBUZZ)
  set(CMAKE_INSTALL_RPATH "${HARFBUZZ_LIBRARY_DIRS}")
  set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)
endif(USE_LOCAL_HARFBUZZ)

option(USE_SRCDIR_FILES
       "Use files in source dir instead of those in installed dir" OFF)

option(USE_DEFAULT_FONT "Install runtime font at DATADIR" ON)
if(USE_DEFAULT_FONT)
  add_definitions(-DPRINTHA_USE_DEFAULT_FONT=1)
endif(USE_DEFAULT_FONT)

option(USE_DEFAULT_ZIPCODE_FONT "Install runtime font at DATADIR" ON)
if(USE_DEFAULT_ZIPCODE_FONT)
  add_definitions(-DPRINTHA_USE_DEFAULT_ZIPCODE_FONT=1)
endif(USE_DEFAULT_ZIPCODE_FONT)

# XXX There's no smart way to check whether Firefox or XULRunner is installed.
option(ENABLE_GUI "XULRunner application" ON)

if(USE_SRCDIR_FILES)
  set(PRINTHA_BINDIR "${PROJECT_BINARY_DIR}")
  set(PRINTHA_DATADIR "${PROJECT_SOURCE_DIR}")
  add_definitions(-DPRINTHA_USE_SRCDIR_FILES=1)
else(USE_SRCDIR_FILES)
  set(PRINTHA_BINDIR "${CMAKE_INSTALL_FULL_BINDIR}")
  set(PRINTHA_DATADIR "${CMAKE_INSTALL_FULL_DATADIR}/printha")
  set(PRINTHA_REL_DATADIR "${CMAKE_INSTALL_DATADIR}/printha")
  install(DIRECTORY settings DESTINATION "${PRINTHA_REL_DATADIR}")
  install(FILES resources/bg.png
          DESTINATION "${PRINTHA_REL_DATADIR}/resources")

  if(USE_DEFAULT_FONT)
    install(DIRECTORY resources/font
            DESTINATION "${PRINTHA_REL_DATADIR}/resources")
  endif(USE_DEFAULT_FONT)

  if(USE_DEFAULT_ZIPCODE_FONT)
    install(DIRECTORY resources/zipfont
            DESTINATION "${PRINTHA_REL_DATADIR}/resources")
  endif(USE_DEFAULT_ZIPCODE_FONT)

  if(ENABLE_GUI)
    install(DIRECTORY gui DESTINATION ${PRINTHA_REL_DATADIR})
    install(PROGRAMS ${PROJECT_BINARY_DIR}/printha.gui
            DESTINATION "${PRINTHA_REL_DATADIR}"
            COMPONENT script)
  endif(ENABLE_GUI)
endif(USE_SRCDIR_FILES)

add_definitions(-DPRINTHA_DATADIR=\"${PRINTHA_DATADIR}\")

# Uninstaller
configure_file ("${PROJECT_SOURCE_DIR}/src/uninstall.sh.in"
                uninstall.sh)

# GUI Launcher
configure_file ("${PROJECT_SOURCE_DIR}/src/printha.gui.in"
                printha.gui)

add_executable(printha
               src/main.cpp
               src/printha_settings.cpp
               src/printha.cpp)

install(TARGETS printha
        RUNTIME
        DESTINATION "${CMAKE_INSTALL_BINDIR}"
        COMPONENT bin)


set(CPACK_GENERATOR "RPM" CACHE STRING "DEB or RPM")

# DEB
set(CPACK_DEBIAN_PACKAGE_PRIORITY "optional")
set(CPACK_DEBIAN_PACKAGE_SECTION "text")
set(CPACK_DEBIAN_ARCHITECTURE ${CMAKE_SYSTEM_PROCESSOR})
set(CPACK_DEBIAN_PACKAGE_DEPENDS
    "libcairo2 (>= 1.8), libfreetype6, libharfbuzz0 (>= 0.9), fontconfig")
set(CPACK_DEBIAN_PACKAGE_RECOMMENDS
    "firefox, iceweasel, xulrunner")

set(${VERSION} CPACK_DEBIAN_PACKAGE_VERSION)

# CPACK
set(CPACK_SET_DESTDIR "on")
set(CPACK_PACKAGING_INSTALL_PREFIX "/opt/${CPACK_PACKAGE_NAME}")

set(CPACK_PACKAGE_FILE_NAME "${CMAKE_PROJECT_NAME}" CACHE STRING
    "Package name")
set(CPACK_PACKAGE_CONTACT "Your Name <username@hostname>" CACHE STRING
    "Package maintainer")

set(CPACK_PACKAGE_DESCRIPTION
"This software helps you to print name/address on Japanese postcards (Hagaki).")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY
"This software helps you to print name/address on Japanese postcards (Hagaki).")

set(CPACK_COMPONENTS_ALL Libraries ApplicationData)

include(CPack)
