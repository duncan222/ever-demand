import React from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { useLazyQuery } from '@apollo/client';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { debounce } from 'lodash';

// TYPES/INTERFACES
import {
	QueryGetMerchantsByNameArgsInterface,
	MerchantsSearchedInterface,
} from '../../client/merchants/argumentInterfaces';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// QUERIES
import { GET_MERCHANTS_QUERY } from '../../client/merchants/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	TouchableCard,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

function SearchScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [searchedValue, setSearchedValue] = React.useState<string>('');
	const [dataLoading, setDataLoading] = React.useState<boolean>(false);

	// QUERIES
	const SEARCH_QUERY = useLazyQuery(GET_MERCHANTS_QUERY);

	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		searchContainer: {
			...GS.px2,
			...GS.row,
			...GS.centered,
			...GS.pt2,
			height: 90,
			backgroundColor: CC.dark,
		},
		containerSearchInput: { ...GS.flex1, ...GS.mr2, height: 57 },
		searchInput: {
			...GS.bgLight,
			...GS.flex1,
			marginTop: -6,
			color: CC.dark,
			fontSize: CS.FONT_SIZE - 1,
		},
		scanBtn: { ...GS.p0, ...GS.my0, ...GS.justifyCenter, height: 57 },
		searchedText: { ...GS.FF_NunitoBold, ...GS.txtUpper },
	});

	// FUNCTIONS
	const debouncedFetchData = React.useMemo(
		() =>
			debounce((text: string) => {
				const MERCHANT_SEARCH_QUERY_ARGS: QueryGetMerchantsByNameArgsInterface =
					{
						searchName: text,
						...(isEmpty(text)
							? {
									geoLocation: {
										city: USER_DATA?.geoLocation.city,
										countryId:
											USER_DATA?.geoLocation?.countryId,
										countryName:
											USER_DATA?.geoLocation?.countryName,
										streetAddress:
											USER_DATA?.geoLocation
												?.streetAddress,
										postcode:
											USER_DATA?.geoLocation?.postcode,
										house: USER_DATA?.geoLocation?.house,
										loc: {
											type:
												USER_DATA?.geoLocation
													?.coordinates?.__typename ||
												'',
											coordinates: [
												USER_DATA?.geoLocation
													?.coordinates?.lng || 0,
												USER_DATA?.geoLocation
													?.coordinates?.lat || 0,
											],
										},
									},
							  }
							: {}),
					};
				setDataLoading(false);
				SEARCH_QUERY[0]({
					variables: MERCHANT_SEARCH_QUERY_ARGS,
				});
			}, 500),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	// EFFECTS
	React.useEffect(() => {
		debouncedFetchData(searchedValue);

		return () => debouncedFetchData.cancel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchedValue]);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader
				title={LANGUAGE.PRODUCTS_VIEW.TITLE}
				showBackBtn
			/>

			<View style={STYLES.searchContainer}>
				<View style={STYLES.containerSearchInput}>
					<TextInput
						value={searchedValue}
						placeholder={LANGUAGE.MERCHANTS_VIEW.NAME}
						style={STYLES.searchInput}
						theme={{
							colors: { text: CC.dark },
							roundness: CS.SPACE,
						}}
						placeholderTextColor={CC.gray}
						left={
							<TextInput.Icon
								name='search'
								color={CC.dark}
								size={18}
								style={GS.mt1}
							/>
						}
						onChangeText={(text) => {
							setDataLoading(true);
							setSearchedValue(text);
						}}
						mode='outlined'
					/>
				</View>

				<Button
					style={STYLES.scanBtn}
					theme={{ roundness: CS.SPACE }}
					uppercase={false}
					mode='contained'>
					<MaterialIcon
						name='qrcode-scan'
						color={CC.light}
						size={16}
					/>{' '}
					{LANGUAGE.SCAN}
				</Button>
			</View>

			<View style={{ ...GS.centered, ...GS.pt3, ...GS.pb4 }}>
				<Text style={STYLES.searchedText}>
					{!isEmpty(searchedValue)
						? LANGUAGE.MERCHANTS_VIEW.WITH_NAME +
						  ' "' +
						  searchedValue +
						  '"'
						: LANGUAGE.MERCHANTS_VIEW.CLOSE_TO_YOU}
				</Text>
			</View>

			{SEARCH_QUERY[1].loading || dataLoading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={CC.white} size={25} />
				</View>
			) : SEARCH_QUERY[1]?.data?.getMerchantsBuyName?.length ? (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.px2 }}>
					{(SEARCH_QUERY[1]?.data
						? (SEARCH_QUERY[1]?.data
								?.getMerchantsBuyName as MerchantsSearchedInterface[])
						: []
					).map((_item, _index) => (
						<TouchableCard
							key={_index}
							img={_item.logo}
							title={_item.name}
							titleStyle={{ color: CC.primary }}
							indicatorIconProps={{ name: 'chevron-right' }}
							height={65}
							style={GS.mb2}
							onPress={() => {}}
						/>
					))}
				</ScrollView>
			) : (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.screen, ...GS.centered }}>
					<Title>{LANGUAGE.NOT_FOUND}</Title>
				</ScrollView>
			)}
		</View>
	);
}

export default SearchScreen;