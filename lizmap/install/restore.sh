#!/bin/bash

if [ "$1" == "" ]; then
    echo "Error: backup directory is missing"
fi
BACKUPDIR="$1"
SCRIPTDIR=$(dirname $0)
LIZMAP=$SCRIPTDIR/..

if  [ -f $BACKUPDIR ]; then
    if [ -f $BACKUPDIR/jauth.db ]; then
        cp $BACKUPDIR/jauth.db $LIZMAP/var/db/jauth.db
    fi
    if [ -f $BACKUPDIR/logs.db ]; then
        cp $BACKUPDIR/logs.db $LIZMAP/var/db/logs.db
    fi
    if [ -f $BACKUPDIR/localconfig.ini.php ]; then
        cp $BACKUPDIR/localconfig.ini.php $LIZMAP/var/config/
    fi
    cp $BACKUPDIR/lizmapConfig.ini.php $LIZMAP/var/config/lizmapConfig.ini.php 
    cp $BACKUPDIR/installer.ini.php    $LIZMAP/var/config/installer.ini.php    
    cp $BACKUPDIR/profiles.ini.php     $LIZMAP/var/config/profiles.ini.php     
else
    echo "backup directory does not exists"
    exit 1
fi
