import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  makeStyles,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import CandleChart from 'src/components/Charts/Candle';

const useStyles = makeStyles(() => ({
  root: {},
}));

const Sales = ({ className, ...rest }) => {
  const classes = useStyles();
  const [crudeData, setCrudeData] = useState([]);
  const [filter, setFilter] = useState('lastMonth');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        'https://parcero-api.herokuapp.com/api/prices/?data_before=2020-09-06&date_after=2020-08-01&stock=4&page_size=500'
      );
      const { results } = await response.json();

      setCrudeData(results);
    };
    fetchData();
  }, [filter]);

  const preventDefault = e => {
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.returnValue = false;
  };

  const disableScroll = () => {
    document.addEventListener('wheel', preventDefault, {
      passive: false,
    });
  };

  const enableScroll = () => {
    document.removeEventListener('wheel', preventDefault, false);
  };

  return (
    <Card className={clsx(classes.root, className)} {...rest}>
      <CardHeader
        action={
          <>
            <InputLabel id="period-select" />
            <Select
              labelId="period-select"
              id="demo-simple-select-outlined"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              label="Age"
            >
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="lastYear">1 Year daily</MenuItem>
              <MenuItem value="lastYearWeekly">1 Year weekly</MenuItem>
              <MenuItem value="last5Days">Last 5 days</MenuItem>
            </Select>
          </>
        }
        title="Latest Sales"
      />
      <Divider />
      <CardContent>
        <div onMouseEnter={disableScroll} onMouseLeave={enableScroll}>
          {crudeData.length && <CandleChart data={crudeData} />}
        </div>
      </CardContent>
      <Divider />
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          Overview
        </Button>
      </Box>
    </Card>
  );
};

Sales.propTypes = {
  className: PropTypes.string,
};

export default Sales;
