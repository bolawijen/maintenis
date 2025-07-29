import { InfoBox } from '@maintenis/tilik-sdk/Component/InfoBox';
import { EmojiObjects } from '@mui/icons-material';
import { Typography, Link } from '@mui/material';


export default function EmptyDebugData() {
    return (
        <InfoBox
            title="No debug entries found"
            text={
                <>
                    <Typography>Make sure you have enabled debugger and run your application.</Typography>
                    <Typography>
                        Check the "yiisoft/yii-debug" in the "params.php" on the backend or with{' '}
                        <Link href="/inspector/config/parameters?filter=yiisoft/yii-debug">Inspector</Link>.
                    </Typography>
                    <Typography>
                        See more information on the link{' '}
                        <Link href="https://github.com/yiisoft/yii-debug">
                            https://github.com/yiisoft/yii-debug
                        </Link>
                        .
                    </Typography>
                </>
            }
            severity="info"
            icon={<EmojiObjects />}
        />
    );
}