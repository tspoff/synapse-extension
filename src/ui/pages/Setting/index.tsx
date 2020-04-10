import * as React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const useStyles = makeStyles({
  container: {
    margin: 30
  },
  link: {
    textDecoration: 'none',
    fontSize: 16
  },
  linkText: {
    color: '#333',
    padding: '25px 0',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
  },
});

interface AppProps {}

interface AppState {}

const settingItems = [
  {
    link: '/export-mnemonic',
    text: 'Export Mnemonic',
    testId: 'exportMnemonic',
  },
  {
    link: '/export-private-key',
    text: 'Export Private Key',
    testId: 'exportPrivateKey',
  },
  {
    link: '/import-private-key',
    text: 'Import Private Key',
    testId: 'importPrivateKey',
  }
]

export default function(props: AppProps, state: AppState) {
  const classes = useStyles();
  const settingElem = settingItems.map((item, index) => {
    return (
      <Link href={item.link} className={classes.link} key={index}>
        <div className={classes.linkText} data-testid={item.testId}>
          {item.text}
          <KeyboardArrowRightIcon />
        </div>
      </Link>
    )
  })

  return (
    <div className={classes.container}>
      {settingElem}
    </div>
  );
}
