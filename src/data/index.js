export default [

	{
		id: ':sample:us-historical-budget-data',
		permanent: true,
		metadata: {
			title: 'US Historical Revenue, Public Debt and GDP',
			source: 'https://www.cbo.gov/about/products/budget-economic-data'
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
			source: 'https://data.cityofnewyork.us/City-Government/311-Call-Center-Inquiry/tdd6-3ysr'
		},
		attachments: {
			data: () => import('./nyc-311-call-center-inquiries.json')
		}
	},


	{
		id: ':sample:basque-daily-time-use-data-2013',
		permanent: true,
		metadata: {
			title: 'Basque Country Daily Time Use Data 2013'
		},
		attachments: {
			data: () => import('./basque-daily-time-use-data-2013.json')
		}
	},


	{
		id: ':sample:mars-weather-report-feb14-20-2019',
		permanent: true,
		metadata: {
			title: 'Mars Weather Report Feb 24-20 2019'
		},
		attachments: {
			data: () => import('./mars-weather-report-feb14-20-2019.json')
		}
	},

	{
		id: ':sample:un-cities-indicator-index',
		permanent: true,
		metadata: {
			title: 'UN Sustainable Development Goals Index - US Cities'
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
			source: 'http://www.randomservices.org/random/data/HorseKicks.html'
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
			licenseLink: 'https://creativecommons.org/publicdomain/zero/1.0/'
		},
		attachments: {
			data: () => import('./honeyproduction.json')
		}
	}
];
