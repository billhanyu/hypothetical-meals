# Backup Admin Guide

Our backup system is performed via a MySQL dump between our server Duke VCM server (main server) and a dedicated database backup Duke VCM server (backup server). To begin explaining our backup process, let us take a look at a shell script in our backup server:

```shell
echo "Beginning backup at $(date +'%m/%d/%Y %H:%M:%S.%N')." | mail -s "[BEGIN] Database Backup for Kung Foods $(date +'%m-%d-%Y')" han.yu@duke.edu christine.zhou@duke.edu brian.zhou@duke.edu eric.s.song@duke.edu
CURRENT_DATE_FILE="$(date +'%m-%d-%Y')-backup.sql"

if output="$(ssh vcm@vcm-3173.vm.duke.edu "mysqldump -u root -p'billsucks' meals" > "$CURRENT_DATE_FILE")"; then
        echo "Backup Complete at $(date +'%m/%d/%Y %H:%M:%S.%N')." | mail -s "[COMPLETE] Database Backup for Kung Foods $(date +'%m-%d-%Y')" han.yu@duke.edu christine.zhou@duke.edu brian.zhou@duke.edu eric.s.song@duke.edu
else
        echo "Backup Failed at $(date +'%m/%d/%Y %H:%M:%S.%N'). Reason: $(cat ./errors.log)" | mail -s "[FAILURE] Database Backup for Kung Foods $(date +'%m-%d-%Y')" han.yu@duke.edu christine.zhou@duke.edu brian.zhou@duke.edu eric.s.song@duke.edu
fi

DAY_ONE_WEEK_AGO="$(date --date='1 week ago' +'%d')"
DATE_ONE_WEEK_AGO_FILE="$(date --date='1 week ago' +'%m-%d-%Y')-backup.sql"
if [ "$DAY_ONE_WEEK_AGO" != "1" -a "$DAY_ONE_WEEK_AGO" != "8" -a "$DAY_ONE_WEEK_AGO" != "15" -a "$DAY_ONE_WEEK_AGO" != "22" -a "$DAY_ONE_WEEK_AGO" != "29" ]; then
        rm -f "/home/vcm/$DATE_ONE_WEEK_AGO_FILE"
fi

DAY_ONE_MONTH_AGO="$(date +'%d')"
DATE_ONE_MONTH_AGO_FILE="$(date --date='1 month ago' +'%m-%d-%Y')-backup.sql"
if [ "$DAY_ONE_MONTH_AGO" != "1" ]
then
        rm -f "/home/vcm/$DATE_ONE_MONTH_AGO_FILE"
fi

rm -f "/home/vcm/errors.log"
## Walkthrough of Shell script

This executable shell script is run daily at 5am EST with a crontab. A Gmail account was created to notify the Kung Foods developers on the daily backup status, and its credentials were configured within the Linux "mail" program. The first line simply sends an email to the developers stating that the backup is about to begin, and the email gives some date/time information.  Next, the "mysqldump" command is used in tandem with an "ssh" command to directly go into the main server's database and save an entire snapshot of the database. It is then "dump"ed into the backup server's home directly under the file name of "(date)-backup.sql". Don't worry, the ssh is performed with the main server having the backup server's public key as an authorized_key, and password ssh is turned off, so the security of the system is not compromised (unless the backup server is compromised, but it has the same level of security with authorized keys and password authentication disabled as well). If the backup is completed successfully, another success email is sent to the developers notifying them of the backup completion. On failure, a failure email is sent to the developers that specifies the time of failure and the error logs (stored temporarily in errors.log and then deleted at the end of the bash script).

The rest of the code handles deleting old backups that maintain the staggered amount of backups as stated by our design requirements. First, the day of the month of the backup from exactly a week ago is checked to see whether it is one we would like to keep (day of the month MOD 7 == 1). If not, then we remove the file. This way, only one backup is kept per week within the month. Furthermore, we check for the existence of a backup exactly a month ago, and make sure to delete it if it is not the first day of the month. This way, only one backup is also kept per month within the year.

## Restoring Database Backup
The "mysqldump" command makes it extremely trivial to restore a backup file to the database. The create_database.sql file that we maintain within our server/ directory clears and reinitializes the tables in our database. Then, simply running the backup.sql file will populate all the tables with the data that was snapshotted at the time of the backup. As long as there are no errors in running the backup.sql file, the format of the data is valid.