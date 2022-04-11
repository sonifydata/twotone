export default [

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
