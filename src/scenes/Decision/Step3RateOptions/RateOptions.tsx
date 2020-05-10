import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Fade from '@material-ui/core/Fade';
import * as LongStrings from '../../../constants/InfoDialogTexts';
import InfoDialog from '../../../components/InfoDialog';
import {RootState} from '../../../redux/rootReducer';
import theme from '../../../muiTheme';
import RatedOptionsSlice, {RatedOption} from '../../../redux/actionsAndSlicers/RatedOptionsSlice';

const useStyles = makeStyles({
	divMain: {
		paddingTop: theme.spacing(2.5),
		paddingBottom: theme.spacing(5.5),
		textAlign: 'center',
		alignContent: 'center',
	},

	infoButton: {
		bottom: theme.spacing(0.25),
		left: theme.spacing(1),
	},

	paper: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(2),
		marginRight: theme.spacing(2),
		marginLeft: theme.spacing(2),
	},

	mainGridItem: {
		minWidth: theme.spacing(40),
		maxWidth: theme.spacing(50),
		marginTop: theme.spacing(1),
	},

	titleGridItem: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},

	gridItemGridContainer: {
		paddingBottom: theme.spacing(2),
	},

	gridItemGridContainerTitle: {
		paddingLeft: theme.spacing(2),
	},

	sliderLeftText: {
		paddingLeft: theme.spacing(1.8),
		paddingRight: theme.spacing(1.8),
		marginTop: theme.spacing(1),
		textAlign: 'left',
	},

	sliderRightText: {
		paddingLeft: theme.spacing(1.8),
		paddingRight: theme.spacing(1.8),
		marginTop: theme.spacing(1),
		textAlign: 'right',
	},

	gridItemSlider: {
		marginTop: theme.spacing(-2),
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
	},

	sliderMarks: {
		height: 8,
		width: 1,
		marginTop: -3,
		backgroundColor: theme.palette.primary.main,
	},

	sliderTrack: {
		opacity: 100,
	},

	emptySpace: {
		height: theme.spacing(4),
	},
});

type Props = {
	hidden: boolean;
};

const RateOptions: React.FC<Props> = (props: Props) => {
	const {hidden} = props;

	const [showInfo, setShowInfo] = useState(false);
	const [startAnimation, setStartAnimation] = useState(false);

	const {selectionCriteria, decisionOptions} = useSelector((state: RootState) => state.OptionsAndCriteria, shallowEqual);

	const ratedOptions = useSelector((state: RootState) => state.RatedOptions, shallowEqual);

	const classes = useStyles();
	const dispatch = useDispatch();

	const sliderMarks = [
		{
			value: 2,
		},
		{
			value: 26,
		},
		{
			value: 50,
		},
		{
			value: 74,
		},
		{
			value: 98,
		},
	];

	useEffect(() => {
		if (!hidden) {
			createRatedOptions();
			setStartAnimation(true);
		} else {
			setStartAnimation(false);
		}
	}, [hidden]);

	const onChange = (event: React.BaseSyntheticEvent, criteriaId: number, optionId: number, score: number) => {
		ratedOptions.forEach(option => {
			if (option.selectionCriteriaId === criteriaId && option.decisionOptionId === optionId)
				dispatch(RatedOptionsSlice.actions.updateRatedOptions({...option, score}));
		});
	};

	const createRatedOptions = () => {
		let newRatedOption: RatedOption[] = ratedOptions;

		let id = Math.max(...ratedOptions.map(object => object.id), 0) + 1;

		decisionOptions.forEach(option => {
			selectionCriteria.forEach(criteria => {
				const foundRatedOption = ratedOptions.find(
					obj => obj.selectionCriteriaId === criteria.id && obj.decisionOptionId === option.id
				);

				if (foundRatedOption == null) {
					newRatedOption = [
						...newRatedOption,
						{
							id,
							score: 50,
							decisionOptionId: option.id,
							selectionCriteriaId: criteria.id,
						},
					];

					id += 1;
				}
			});
		});

		dispatch(RatedOptionsSlice.actions.setRatedOptions(newRatedOption));
	};

	const getScore = (criteriaId: number, optionId: number): number => {
		const foundRatedOption = ratedOptions.find(
			obj => obj.selectionCriteriaId === criteriaId && obj.decisionOptionId === optionId
		);

		return foundRatedOption == null ? 50 : foundRatedOption.score;
	};
	//TODO don't allow to select text on scroll
	return (
		<div className={classes.divMain}>
			<Grid container justify='center' alignContent='center'>
				<Grid item xs={12}>
					<Typography component='span' variant='h5' gutterBottom>
						Rate Options
						<IconButton
							data-testid='RateOptionsInfoButton'
							aria-label='Help'
							className={classes.infoButton}
							onClick={() => setShowInfo(true)}
						>
							<InfoIcon color='secondary' />
						</IconButton>
					</Typography>
				</Grid>
				{!hidden &&
					selectionCriteria.map((criteria, criteriaIndex) => (
						<Fade
							key={criteria.id}
							in={startAnimation}
							timeout={500}
							style={{
								transitionDelay: `${criteriaIndex * 100}ms`,
							}}
						>
							<Grid item xs={6} className={classes.mainGridItem} key={criteria.id}>
								<Paper className={classes.paper} elevation={2} key={criteria.id}>
									<div>
										<Grid container>
											<Grid item xs={12} className={classes.titleGridItem}>
												<Typography component='span' variant='h6'>
													{criteria.name}
												</Typography>
											</Grid>
											{decisionOptions.map((option, optionIndex) => (
												<Grid
													container
													justify='center'
													alignItems='center'
													className={classes.gridItemGridContainer}
													key={option.id}
												>
													<Grid item xs={4} className={classes.gridItemGridContainerTitle}>
														<Typography component='span' variant='body1'>
															{option.name}
														</Typography>
													</Grid>
													<Grid item xs={8}>
														<Grid container>
															<Grid item xs={6} className={classes.sliderLeftText}>
																<Typography
																	variant='caption'
																	style={{
																		fontSize: 11,
																	}}
																>
																	Bad
																</Typography>
															</Grid>
															<Grid item xs={6} className={classes.sliderRightText}>
																<Typography
																	variant='caption'
																	style={{
																		fontSize: 11,
																	}}
																>
																	Good
																</Typography>
															</Grid>
															<Grid item xs={12} className={classes.gridItemSlider}>
																<Slider
																	data-testid={`slider${criteriaIndex}${optionIndex}`}
																	classes={{
																		track: classes.sliderTrack,
																		rail: classes.sliderTrack,
																		mark: classes.sliderMarks,
																		markActive: classes.sliderMarks,
																	}}
																	value={getScore(criteria.id, option.id)}
																	min={0}
																	max={100}
																	step={1}
																	marks={sliderMarks}
																	onChange={(event, value) => onChange(event, criteria.id, option.id, value as number)}
																/>
															</Grid>
														</Grid>
													</Grid>
												</Grid>
											))}
										</Grid>
									</div>
								</Paper>
							</Grid>
						</Fade>
					))}
			</Grid>
			<div className={classes.emptySpace} />
			<InfoDialog text={LongStrings.OptionsRatingInfo} show={showInfo} onClose={() => setShowInfo(false)} />
		</div>
	);
};

export default RateOptions;
