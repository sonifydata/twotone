export default [
	{ 
		id: 'ShareHistory-SIM-20030603-20231010',
		permanent: true,
		recentlyAdded: true,
		metadata: {
			title: 'SimCorp official share history 2003-2023',
			source: 'https://www.simcorp.com/en/investor/share-information',
			rows: 2000,
		},
		attachments: {
			data: () => import('./simCorp-official-stockprice-2003-2023.json')
		}
	},
	{
		id: "covid-lux-time-series-080222-xlsx:sheet1:33:1037:application-vnd-openxmlformats-officedocument-spreadsheetml-sheet:480026:1651140223145",
		fileName: "COVID_Lux_time_series_080222.xlsx",
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		size: 480026,
		lastModified: 1651140223145,
		permanent: true,
		recentlyAdded: true,
		metadata: {
			title: "SOUND OF DATA Luxembourg COVID time series 08-02-22",
			props: {
				CreatedDate: "2020-npm 04-01T13:22:00.000Z",
				ModifiedDate: "2022-02-10T07:24:51.000Z",
			},
			fields: 33,
			rows: 1037
		},
		imported: 1651174635981,
		attachments: {
			data: ()=> import('./sound-of-data-covid-080222.json')
		}
	},
	{
		id: "esch22-sound-of-data-b40-traffic-data-xlsx:2706-1909-trafficstatus-b40:18:360:application-vnd-openxmlformats-officedocument-spreadsheetml-sheet:32309:1651140220673",
		fileName: "SOUND OF DATA  B40 Traffic Data",
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		size: 32309,
		lastModified: 1651140220673,
		permanent: true,
		recentlyAdded: true,
		metadata: {
			title: "ESCH22_SOUND_OF_DATA_B40_Traffic_Data",
			fields: 18,
			rows: 360
		},
		imported: 1651172695636,
		attachments: {
			data: ()=> import('./sound-of-data-b40-trafficstatus.json')
		}
	},

	{
		id: 'tables2insect-kraghede-1997-2018-2-csv:sheet1:14:1449:text-csv:61125:1640825010748',
		permanent: true,
		recentlyAdded: true,
		fileName: 'TableS2Insect-Kraghede-1997-2018.2.csv',
		type: 'text/csv',
		size: 61125,
		lastModified: 1640825010748,
		metadata: {
			title: 'Declines in abundance of insects in Denmark over 22 years',
			source: 'https://datadryad.org/stash/dataset/doi:10.5061/dryad.gq73493',
			fields: 14,
			rows: 1449
		},
		imported: 1649669275450,
		attachments: {
			data: ()=> import('./insect-kraghede-1997-2018.json')
		}
	},


	{
		id: ':sample:us-historical-budget-data',
		permanent: true,
		metadata: {
			title: 'US Historical Revenue, Public Debt and GDP',
			source: 'https://www.cbo.gov/about/products/budget-economic-data',
			rows: 50,
		},
		attachments: {
			data: () => import('./us-historical-budget-data.json')
		}
	},


	{
		id: ':sample:nyc-311-call-center-inquiries',
		permanent: true,
		metadata: {
			title: 'NYC 311 Call Volume by Agency Feb 1 - 10, 2019',
			source: 'https://data.cityofnewyork.us/City-Government/311-Call-Center-Inquiry/tdd6-3ysr',
			rows: 24
		},
		attachments: {
			data: () => import('./nyc-311-call-center-inquiries.json')
		}
	},


	{
		id: ':sample:basque-daily-time-use-data-2013',
		permanent: true,
		metadata: {
			title: 'Basque Country Daily Time Use Data 2013',
			rows: 288
		},
		attachments: {
			data: () => import('./basque-daily-time-use-data-2013.json')
		}
	},


	{
		id: ':sample:mars-weather-report-feb14-20-2019',
		permanent: true,
		metadata: {
			title: 'Mars Weather Report Feb 24-20 2019',
			rows: 7
		},
		attachments: {
			data: () => import('./mars-weather-report-feb14-20-2019.json')
		}
	},

	{
		id: ':sample:un-cities-indicator-index',
		permanent: true,
		metadata: {
			title: 'UN Sustainable Development Goals Index - US Cities',
			rows: 100
		},
		attachments: {
			data: () => import('./un-cities-indicator-index.json')
		}
	},

	{
		id: ':sample:prussian-cavalry-killed-by-horse-kicks',
		permanent: true,
		metadata: {
			title: 'Prussian cavalry killed by horse kicks',
			source: 'http://www.randomservices.org/random/data/HorseKicks.html',
			rows: 20
		},
		attachments: {
			data: () => import('./prussian-cavalry-killed-by-horse-kicks.json')
		}
	},


	{
		id: ':sample:honeyproduction',
		permanent: true,
		metadata: {
			title: 'Honey Production in the USA (1998-2012)',
			description: 'Honey Production Figures and Prices by National Agricultural Statistics Service',
			source: 'https://www.kaggle.com/jessicali9530/honey-production',
			license: 'CC0: Public Domain',
			licenseLink: 'https://creativecommons.org/publicdomain/zero/1.0/',
			rows: 15
		},
		attachments: {
			data: () => import('./honeyproduction.json')
		}
	}
];
