function t3() {
  let storeFields = [
    {
      required: 'true',
      max_fractions: '1',
      fraction_controls: [
        {
          label: 'Property',
          value: '474781769',
          options: [
            { value: '474781769', value_line_num: 312 },
            { value: '123123123', value_line_num: 313 }
          ],
          label_line_num: 309,
          value_line_num: 310,
          options_line_num: 311,
          name: 'ga_property',
          name_line_num: 308,
          controlClass: 'selector'
        },
        {
          label: 'Cohorts Mode',
          value: 'false',
          label_line_num: 315,
          value_line_num: 316,
          name: 'cohorts_switch',
          name_line_num: 314,
          controlClass: 'switch'
        },
        {
          label: 'Granularity',
          value: 'DAILY',
          options: [
            { value: 'DAILY', value_line_num: 322 },
            { value: 'WEEKLY', value_line_num: 323 },
            { value: 'MONTHLY', value_line_num: 324 }
          ],
          label_line_num: 319,
          value_line_num: 320,
          options_line_num: 321,
          name: 'granularity',
          name_line_num: 317,
          controlClass: 'selector'
        },
        {
          label: 'Start Offset',
          value: '0',
          label_line_num: 327,
          value_line_num: 328,
          name: 'start_offset',
          name_line_num: 325,
          controlClass: 'input'
        },
        {
          label: 'End Offset',
          value: '5',
          label_line_num: 331,
          value_line_num: 332,
          name: 'end_offset',
          name_line_num: 329,
          controlClass: 'input'
        }
      ],
      required_line_num: 305,
      max_fractions_line_num: 306,
      fraction_controls_line_num: 307,
      name: 'top_config',
      name_line_num: 304,
      fieldClass: 'filter',
      label: 'Top Config',
      label_line_num: 0,
      group: 'mf'
    },
    {
      required: 'true',
      max_fractions: '1',
      fraction_controls: [
        {
          label: 'Start Date',
          value: '2025-02-24',
          label_line_num: 340,
          value_line_num: 341,
          name: 'start_date',
          name_line_num: 339,
          controlClass: 'date_picker'
        },
        {
          label: 'End Date',
          value: '2025-02-24',
          label_line_num: 343,
          value_line_num: 344,
          name: 'end_date',
          name_line_num: 342,
          controlClass: 'date_picker'
        }
      ],
      required_line_num: 336,
      max_fractions_line_num: 337,
      fraction_controls_line_num: 338,
      name: 'date_range',
      name_line_num: 334,
      fieldClass: 'filter',
      label: 'Date Range',
      label_line_num: 0,
      group: 'mf'
    },
    {
      required: 'true',
      fraction_controls: [
        {
          label: 'Start Date',
          value: '2025-02-24',
          label_line_num: 351,
          value_line_num: 352,
          name: 'start_date',
          name_line_num: 350,
          controlClass: 'date_picker'
        },
        {
          label: 'End Date',
          value: '2025-02-24',
          label_line_num: 354,
          value_line_num: 355,
          name: 'end_date',
          name_line_num: 353,
          controlClass: 'date_picker'
        }
      ],
      required_line_num: 348,
      fraction_controls_line_num: 349,
      name: 'cohorts_config',
      name_line_num: 346,
      fieldClass: 'filter',
      label: 'Cohorts Config',
      label_line_num: 0,
      group: 'mf'
    },
    {
      result: 'string',
      group: 'geo',
      description: 'The country from which the user activity originated',
      meta: { name: 'country', name_line_num: 517 },
      result_line_num: 513,
      group_line_num: 514,
      description_line_num: 515,
      meta_line_num: 516,
      name: 'country',
      name_line_num: 512,
      fieldClass: 'dimension',
      label: 'Country',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'string',
      group: 'geo',
      description: 'The city from which the user activity originated',
      meta: { name: 'city', name_line_num: 524 },
      result_line_num: 520,
      group_line_num: 521,
      description_line_num: 522,
      meta_line_num: 523,
      name: 'city',
      name_line_num: 519,
      fieldClass: 'dimension',
      label: 'City',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Year',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'years',
      description:
        'The four-digit year of the event. For example, 2020 or 2024',
      meta: { name: 'year', name_line_num: 535 },
      label_line_num: 529,
      result_line_num: 530,
      time_group_line_num: 531,
      detail_line_num: 532,
      description_line_num: 533,
      meta_line_num: 534,
      name: 'year',
      name_line_num: 528,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      label: 'Month',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'months',
      description:
        'The combined values of year and month. Example values include 202212 or 202301',
      meta: { name: 'yearMonth', name_line_num: 544 },
      label_line_num: 538,
      result_line_num: 539,
      time_group_line_num: 540,
      detail_line_num: 541,
      description_line_num: 542,
      meta_line_num: 543,
      name: 'year_month',
      name_line_num: 537,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      label: 'Week Monday',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'weeksMonday',
      description:
        'The combined values of isoWeek and isoYear. Example values include 201652 & 201701',
      meta: { name: 'isoYearIsoWeek', name_line_num: 553 },
      label_line_num: 547,
      result_line_num: 548,
      time_group_line_num: 549,
      detail_line_num: 550,
      description_line_num: 551,
      meta_line_num: 552,
      name: 'iso_year_iso_week',
      name_line_num: 546,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      label: 'Week Sunday',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'weeksSunday',
      description:
        'The combined values of year and week. Example values include 202253 or 202301',
      meta: { name: 'yearWeek', name_line_num: 562 },
      label_line_num: 556,
      result_line_num: 557,
      time_group_line_num: 558,
      detail_line_num: 559,
      description_line_num: 560,
      meta_line_num: 561,
      name: 'year_week',
      name_line_num: 555,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      result: 'string',
      time_group: 'event_created_at',
      detail: 'days',
      description: 'The date of the event, formatted as YYYYMMDD',
      meta: { name: 'date', name_line_num: 570 },
      result_line_num: 565,
      time_group_line_num: 566,
      detail_line_num: 567,
      description_line_num: 568,
      meta_line_num: 569,
      name: 'date',
      name_line_num: 564,
      fieldClass: 'dimension',
      label: 'Date',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      label: 'Hour',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'hours',
      description:
        'The combined values of date and hour formatted as YYYYMMDDHH',
      meta: { name: 'dateHour', name_line_num: 579 },
      label_line_num: 573,
      result_line_num: 574,
      time_group_line_num: 575,
      detail_line_num: 576,
      description_line_num: 577,
      meta_line_num: 578,
      name: 'date_hour',
      name_line_num: 572,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      label: 'Minute',
      result: 'string',
      time_group: 'event_created_at',
      detail: 'minutes',
      description:
        'The combined values of date, hour, and minute formatted as YYYYMMDDHHMM',
      meta: { name: 'dateHourMinute', name_line_num: 588 },
      label_line_num: 582,
      result_line_num: 583,
      time_group_line_num: 584,
      detail_line_num: 585,
      description_line_num: 586,
      meta_line_num: 587,
      name: 'date_hour_minute',
      name_line_num: 581,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0,
      group: 'events',
      groupId: 'event_created_at',
      group_label: 'Event Created At'
    },
    {
      result: 'string',
      group: 'events',
      description:
        "The two-digit hour of the day that the event was logged. This dimension ranges from 0-23 and is reported in your property's timezone",
      meta: { name: 'hour', name_line_num: 595 },
      result_line_num: 591,
      group_line_num: 592,
      description_line_num: 593,
      meta_line_num: 594,
      name: 'hour',
      name_line_num: 590,
      fieldClass: 'dimension',
      label: 'Hour',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'string',
      group: 'events',
      description:
        "The two-digit minute of the hour that the event was logged. This dimension ranges from 0-59 and is reported in your property's timezone",
      meta: { name: 'minute', name_line_num: 602 },
      result_line_num: 598,
      group_line_num: 599,
      description_line_num: 600,
      meta_line_num: 601,
      name: 'minute',
      name_line_num: 597,
      fieldClass: 'dimension',
      label: 'Minute',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'string',
      group: 'events',
      description: 'The day of the month, a two-digit number from 01 to 31',
      meta: { name: 'day', name_line_num: 609 },
      result_line_num: 605,
      group_line_num: 606,
      description_line_num: 607,
      meta_line_num: 608,
      name: 'day',
      name_line_num: 604,
      fieldClass: 'dimension',
      label: 'Day',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Day of week',
      result: 'string',
      group: 'events',
      description:
        'The integer day of the week. It returns values in the range 0 to 6 with Sunday as the first day of the week',
      meta: { name: 'dayOfWeek', name_line_num: 617 },
      label_line_num: 612,
      result_line_num: 613,
      group_line_num: 614,
      description_line_num: 615,
      meta_line_num: 616,
      name: 'day_of_week',
      name_line_num: 611,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Day of week name',
      result: 'string',
      group: 'events',
      description:
        'The day of the week in English. This dimension has values such as Sunday or Monday',
      meta: { name: 'dayOfWeekName', name_line_num: 625 },
      label_line_num: 620,
      result_line_num: 621,
      group_line_num: 622,
      description_line_num: 623,
      meta_line_num: 624,
      name: 'day_of_week_name',
      name_line_num: 619,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Week',
      result: 'string',
      group: 'events',
      description:
        'The week of the event, a two-digit number from 01 to 53. Each week starts on Sunday. January 1st is always in week 01. The first and last week of the year have fewer than 7 days in most years. Weeks other than the first and the last week of the year always have 7 days. For years where January 1st is a Sunday, the first week of that year and the last week of the prior year have 7 days',
      meta: { name: 'week', name_line_num: 633 },
      label_line_num: 628,
      result_line_num: 629,
      group_line_num: 630,
      description_line_num: 631,
      meta_line_num: 632,
      name: 'week',
      name_line_num: 627,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'string',
      group: 'events',
      description: 'The month of the event, a two digit integer from 01 to 12',
      meta: { name: 'month', name_line_num: 640 },
      result_line_num: 636,
      group_line_num: 637,
      description_line_num: 638,
      meta_line_num: 639,
      name: 'month',
      name_line_num: 635,
      fieldClass: 'dimension',
      label: 'Month',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'ISO year',
      result: 'string',
      group: 'events',
      description:
        'The ISO year of the event. For details, see http://en.wikipedia.org/wiki/ISO_week_date. Example values include 2022 & 2023',
      meta: { name: 'isoYear', name_line_num: 648 },
      label_line_num: 643,
      result_line_num: 644,
      group_line_num: 645,
      description_line_num: 646,
      meta_line_num: 647,
      name: 'iso_year',
      name_line_num: 642,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'ISO week of the year',
      result: 'string',
      group: 'events',
      description:
        'ISO week number, where each week starts on Monday. For details, see http://en.wikipedia.org/wiki/ISO_week_date. Example values include 01, 02, & 53',
      meta: { name: 'isoWeek', name_line_num: 656 },
      label_line_num: 651,
      result_line_num: 652,
      group_line_num: 653,
      description_line_num: 654,
      meta_line_num: 655,
      name: 'iso_week',
      name_line_num: 650,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth year',
      result: 'string',
      description:
        'The number of years since the start of the date range. The starting year is 0000',
      group: 'events',
      meta: { name: 'nthYear', name_line_num: 664 },
      label_line_num: 659,
      result_line_num: 660,
      description_line_num: 661,
      group_line_num: 662,
      meta_line_num: 663,
      name: 'nth_year',
      name_line_num: 658,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth month',
      result: 'string',
      group: 'events',
      description:
        'The number of months since the start of a date range. The starting month is 0000',
      meta: { name: 'nthMonth', name_line_num: 672 },
      label_line_num: 667,
      result_line_num: 668,
      group_line_num: 669,
      description_line_num: 670,
      meta_line_num: 671,
      name: 'nth_month',
      name_line_num: 666,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth week',
      result: 'string',
      group: 'events',
      description:
        'A number representing the number of weeks since the start of a date range',
      meta: { name: 'nthWeek', name_line_num: 680 },
      label_line_num: 675,
      result_line_num: 676,
      group_line_num: 677,
      description_line_num: 678,
      meta_line_num: 679,
      name: 'nth_week',
      name_line_num: 674,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth day',
      result: 'string',
      group: 'events',
      description: 'The number of days since the start of the date range',
      meta: { name: 'nthDay', name_line_num: 688 },
      label_line_num: 683,
      result_line_num: 684,
      group_line_num: 685,
      description_line_num: 686,
      meta_line_num: 687,
      name: 'nth_day',
      name_line_num: 682,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth hour',
      result: 'string',
      group: 'events',
      description:
        'The number of hours since the start of the date range. The starting hour is 0000',
      meta: { name: 'nthHour', name_line_num: 696 },
      label_line_num: 691,
      result_line_num: 692,
      group_line_num: 693,
      description_line_num: 694,
      meta_line_num: 695,
      name: 'nth_hour',
      name_line_num: 690,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Nth minute',
      result: 'string',
      group: 'events',
      description:
        'The number of minutes since the start of the date range. The starting minute is 0000',
      meta: { name: 'nthMinute', name_line_num: 704 },
      label_line_num: 699,
      result_line_num: 700,
      group_line_num: 701,
      description_line_num: 702,
      meta_line_num: 703,
      name: 'nth_minute',
      name_line_num: 698,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'string',
      group: 'cohorts',
      required: 'true',
      description:
        "The cohort's name in the request. A cohort is a set of users who started using your website or app in any consecutive group of days. If a cohort name is not specified in the request, cohorts are named by their zero based index such as cohort_0 and cohort_1",
      meta: { name: 'cohort', name_line_num: 715 },
      result_line_num: 709,
      group_line_num: 710,
      required_line_num: 712,
      description_line_num: 713,
      meta_line_num: 714,
      name: 'cohort',
      name_line_num: 708,
      fieldClass: 'dimension',
      label: 'Cohort',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Daily cohort',
      result: 'string',
      group: 'cohorts',
      description:
        'Day offset relative to the firstSessionDate for the users in the cohort. For example, if a cohort is selected with the start and end date of 2020-03-01, then for the date 2020-03-02, cohortNthDay will be 0001',
      meta: { name: 'cohortNthDay', name_line_num: 723 },
      label_line_num: 718,
      result_line_num: 719,
      group_line_num: 720,
      description_line_num: 721,
      meta_line_num: 722,
      name: 'cohort_nth_day',
      name_line_num: 717,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Weekly cohort',
      result: 'string',
      group: 'cohorts',
      description:
        'Week offset relative to the firstSessionDate for the users in the cohort. Weeks start on Sunday and end on Saturday. For example, if a cohort is selected with the start and end date in the range 2020-11-08 to 2020-11-14, then for the dates in the range 2020-11-15 to 2020-11-21, cohortNthWeek will be 0001',
      meta: { name: 'cohortNthWeek', name_line_num: 731 },
      label_line_num: 726,
      result_line_num: 727,
      group_line_num: 728,
      description_line_num: 729,
      meta_line_num: 730,
      name: 'cohort_nth_week',
      name_line_num: 725,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      label: 'Monthly cohort',
      result: 'string',
      group: 'cohorts',
      description:
        'Month offset relative to the firstSessionDate for the users in the cohort. Month boundaries align with calendar month boundaries. For example, if a cohort is selected with the start and end date in March 2020, then for any date in April 2020, cohortNthMonth will be 0001',
      meta: { name: 'cohortNthMonth', name_line_num: 739 },
      label_line_num: 734,
      result_line_num: 735,
      group_line_num: 736,
      description_line_num: 737,
      meta_line_num: 738,
      name: 'cohort_nth_month',
      name_line_num: 733,
      fieldClass: 'dimension',
      type: 'custom',
      type_line_num: 0
    },
    {
      result: 'number',
      group: 'users',
      description: 'The number of distinct users who visited your site or app',
      meta: {
        name: 'activeUsers',
        type: 'TYPE_INTEGER',
        name_line_num: 748,
        type_line_num: 749
      },
      result_line_num: 744,
      group_line_num: 745,
      description_line_num: 746,
      meta_line_num: 747,
      name: 'active_users',
      name_line_num: 743,
      fieldClass: 'measure',
      label: 'Active Users',
      label_line_num: 0,
      format_number: ',.0f',
      format_number_line_num: 0,
      currency_prefix: '$',
      currency_prefix_line_num: 0,
      currency_suffix: '',
      currency_suffix_line_num: 0
    },
    {
      result: 'number',
      group: 'sessions',
      description:
        'The number of sessions that began on your site or app (event triggered: session_start)',
      meta: {
        name: 'sessions',
        type: 'TYPE_INTEGER',
        name_line_num: 756,
        type_line_num: 757
      },
      result_line_num: 752,
      group_line_num: 753,
      description_line_num: 754,
      meta_line_num: 755,
      name: 'sessions',
      name_line_num: 751,
      fieldClass: 'measure',
      label: 'Sessions',
      label_line_num: 0,
      format_number: ',.0f',
      format_number_line_num: 0,
      currency_prefix: '$',
      currency_prefix_line_num: 0,
      currency_suffix: '',
      currency_suffix_line_num: 0
    },
    {
      result: 'number',
      group: 'page_screens',
      description:
        'The number of app screens or web pages your users viewed. Repeated views of a single page or screen are counted. (screen_view + page_view events)',
      meta: {
        name: 'screenPageViews',
        type: 'TYPE_INTEGER',
        name_line_num: 764,
        type_line_num: 765
      },
      result_line_num: 760,
      group_line_num: 761,
      description_line_num: 762,
      meta_line_num: 763,
      name: 'screen_page_views',
      name_line_num: 759,
      fieldClass: 'measure',
      label: 'Screen Page Views',
      label_line_num: 0,
      format_number: ',.0f',
      format_number_line_num: 0,
      currency_prefix: '$',
      currency_prefix_line_num: 0,
      currency_suffix: '',
      currency_suffix_line_num: 0
    },
    {
      label: 'Cohort active users',
      result: 'number',
      group: 'cohorts',
      description:
        'The number of users in the cohort who are active in the time window corresponding to the cohort nth day/week/month. For example in the row where cohortNthWeek = 0001, this metric is the number of users (in the cohort) who are active in week 1',
      meta: {
        name: 'cohortActiveUsers',
        type: 'TYPE_INTEGER',
        name_line_num: 775,
        type_line_num: 776
      },
      label_line_num: 770,
      result_line_num: 771,
      group_line_num: 772,
      description_line_num: 773,
      meta_line_num: 774,
      name: 'cohort_active_users',
      name_line_num: 769,
      fieldClass: 'measure',
      format_number: ',.0f',
      format_number_line_num: 0,
      currency_prefix: '$',
      currency_prefix_line_num: 0,
      currency_suffix: '',
      currency_suffix_line_num: 0
    },
    {
      label: 'Cohort total users',
      result: 'number',
      group: 'cohorts',
      description:
        "The total number of users in the cohort. This metric is the same value in every row of the report for each cohort. Because cohorts are defined by a shared acquisition date, cohortTotalUsers is the same as cohortActiveUsers for the cohort's selection date range. For report rows later than the cohort's selection range, it is typical for cohortActiveUsers to be smaller than cohortTotalUsers. This difference represents users from the cohort that were not active for the later date. cohortTotalUsers is commonly used in the metric expression cohortActiveUsers/cohortTotalUsers to compute a user retention fraction for the cohort. The relationship between activeUsers and totalUsers is not equivalent to the relationship between cohortActiveUsers and cohortTotalUsers",
      meta: {
        name: 'cohortTotalUsers',
        type: 'TYPE_INTEGER',
        name_line_num: 784,
        type_line_num: 785
      },
      label_line_num: 779,
      result_line_num: 780,
      group_line_num: 781,
      description_line_num: 782,
      meta_line_num: 783,
      name: 'cohort_total_users',
      name_line_num: 778,
      fieldClass: 'measure',
      format_number: ',.0f',
      format_number_line_num: 0,
      currency_prefix: '$',
      currency_prefix_line_num: 0,
      currency_suffix: '',
      currency_suffix_line_num: 0
    }
  ];
  let queryOrderBy = [
    {
      fieldId: 'city',
      field: {
        result: 'string',
        group: 'geo',
        description: 'The city from which the user activity originated',
        meta: { name: 'city', name_line_num: 524 },
        result_line_num: 520,
        group_line_num: 521,
        description_line_num: 522,
        meta_line_num: 523,
        name: 'city',
        name_line_num: 519,
        fieldClass: 'dimension',
        label: 'City',
        label_line_num: 0,
        type: 'custom',
        type_line_num: 0
      },
      desc: false
    }
  ];
  let selectedDimensions = [
    {
      result: 'string',
      group: 'geo',
      description: 'The city from which the user activity originated',
      meta: { name: 'city', name_line_num: 524 },
      result_line_num: 520,
      group_line_num: 521,
      description_line_num: 522,
      meta_line_num: 523,
      name: 'city',
      name_line_num: 519,
      fieldClass: 'dimension',
      label: 'City',
      label_line_num: 0,
      type: 'custom',
      type_line_num: 0
    }
  ];
  let selectedMeasures = [];
  let queryParameters = [
    {
      fieldId: 'city',
      fractions: [
        {
          operator: 'Or',
          type: 'StoreFraction',
          storeResult: 'string',
          storeFractionSubType: 'exact',
          meta: {
            match_type: 'EXACT',
            filter_type: 'stringFilter',
            match_type_line_num: 422,
            filter_type_line_num: 423
          },
          logicGroup: 'AND_NOT',
          storeFractionSubTypeOptions: [
            { value: 'exact' },
            { value: 'begins_with' },
            { value: 'ends_with' },
            { value: 'contains' },
            { value: 'full_regexp' },
            { value: 'partial_regexp' },
            { value: 'in_list' }
          ],
          controls: [
            { name: 'value_input', controlClass: 'input', value: 'h' },
            {
              value: false,
              label: 'Case Sensitive',
              name: 'case_sensitive_switch',
              controlClass: 'switch'
            }
          ]
        }
      ],
      field: {
        id: 'city',
        hidden: false,
        label: 'City',
        fieldClass: 'dimension',
        result: 'string',
        sqlName: 'city',
        topId: 'geo',
        topLabel: 'geo',
        description: 'The city from which the user activity originated',
        type: 'custom'
      }
    },
    {
      fieldId: 'date_range',
      fractions: [
        {
          type: 'StoreFraction',
          controls: [
            {
              value: '2025-02-24',
              label: 'Start Date',
              name: 'start_date',
              controlClass: 'date_picker'
            },
            {
              value: '2025-02-24',
              label: 'End Date',
              name: 'end_date',
              controlClass: 'date_picker'
            }
          ]
        }
      ]
    },
    {
      fieldId: 'top_config',
      fractions: [
        {
          type: 'StoreFraction',
          controls: [
            {
              options: [
                { value: '474781769', value_line_num: 312 },
                { value: '123123123', value_line_num: 313 }
              ],
              value: '474781769',
              label: 'Property',
              name: 'ga_property',
              controlClass: 'selector'
            },
            {
              value: false,
              label: 'Cohorts Mode',
              name: 'cohorts_switch',
              controlClass: 'switch'
            }
          ]
        }
      ]
    }
  ];
  let queryLimit = 500;

  let orderByElements = [];

  queryOrderBy.forEach(x => {
    let orderBy;

    if (
      selectedDimensions.map(field => field.name).indexOf(x.field.name) > -1
    ) {
      orderBy = {
        dimension: { dimensionName: x.field.meta.name },
        desc: x.desc
      };
    } else if (
      selectedMeasures.map(field => field.name).indexOf(x.field.name) > -1
    ) {
      orderBy = {
        metric: { metricName: x.field.meta.name },
        desc: x.desc
      };
    }

    orderByElements.push(orderBy);
  });

  let dimOrExpressions = [];
  let dimAndNotExpressions = [];

  let mcOrExpressions = [];
  let mcAndNotExpressions = [];

  queryParameters.map(filter => {
    let field = storeFields.find(x => x.name === filter.fieldId);

    filter.fractions.forEach(fraction => {
      let apiFilter;
      let apiFilterType = fraction.meta?.filter_type;

      if (apiFilterType === 'stringFilter') {
        apiFilter = {
          fieldName: field.meta.name,
          stringFilter: {
            matchType: fraction.meta.match_type,
            value: fraction.controls.find(
              control => control['name'] === 'value_input'
            )?.value,
            caseSensitive: fraction.controls.find(
              control => control['name'] === 'case_sensitive_switch'
            )?.value
          }
        };
      }

      if (apiFilterType === 'inListFilter') {
        apiFilter = {
          fieldName: field.meta.name,
          inListFilter: {
            values: fraction.controls.find(
              control => control['name'] === 'values_input'
            )?.values,
            caseSensitive: fraction.controls.find(
              control => control['name'] === 'case_sensitive_switch'
            )?.value
          }
        };
      }

      if (apiFilterType === 'numericFilter') {
        apiFilter = {
          fieldName: field.meta.name,
          numericFilter: {
            operation: fraction.meta.operation,
            value: fraction.controls.find(
              control => control['name'] === 'value_input'
            )?.value
          }
        };
      }

      if (apiFilterType === 'betweenFilter') {
        apiFilter = {
          fieldName: field.meta.name,
          betweenFilter: {
            fromValue: fraction.controls.find(
              control => control['name'] === 'value_from_input'
            )?.value,
            toValue: fraction.controls.find(
              control => control['name'] === 'value_to_input'
            )?.value
          }
        };
      }

      if (field.fieldClass === 'dimension') {
        if (fraction.logicGroup === 'OR') {
          dimOrExpressions.push({ filter: apiFilter });
        }
        if (fraction.logicGroup === 'AND_NOT') {
          dimAndNotExpressions.push({
            notExpression: {
              filter: apiFilter
            }
          });
        }
      }

      if (field.fieldClass === 'measure') {
        if (fraction.logicGroup === 'OR') {
          mcOrExpressions.push({ filter: apiFilter });
        }
        if (fraction.logicGroup === 'AND_NOT') {
          mcAndNotExpressions.push({
            notExpression: {
              filter: apiFilter
            }
          });
        }
      }
    });
  });

  let isCohortsEnabled = queryParameters
    .find(x => x['fieldId'] === 'top_config')
    ?.fractions[0].controls.find(
      control => control.name === 'cohorts_switch'
    )?.value;

  let dateRanges;
  let cohortSpec;

  if (isCohortsEnabled === true) {
    let cohorts = [];

    queryParameters
      .find(x => x['fieldId'] === 'cohorts_config')
      ?.fractions.forEach(fraction => {
        let cohort = {
          dimension: 'firstSessionDate',
          dateRange: {
            startDate: fraction.controls.find(
              control => control.name === 'start_date'
            )?.value,
            endDate: fraction.controls.find(
              control => control.name === 'end_date'
            )?.value
          }
        };
        cohorts.push(cohort);
      });

    cohortSpec = {
      cohorts: cohorts,
      cohortsRange: {
        granularity: queryParameters
          .find(x => x['fieldId'] === 'top_config')
          ?.fractions[0].controls.find(
            control => control.name === 'granularity'
          )?.value,
        startOffset: queryParameters
          .find(x => x['fieldId'] === 'top_config')
          ?.fractions[0].controls.find(
            control => control.name === 'start_offset'
          )?.value,
        endOffset: queryParameters
          .find(x => x['fieldId'] === 'top_config')
          ?.fractions[0].controls.find(control => control.name === 'end_offset')
          ?.value
      }
    };
  } else {
    dateRanges = [
      {
        startDate: queryParameters
          .find(x => x['fieldId'] === 'date_range')
          ?.fractions[0].controls.find(control => control.name === 'start_date')
          ?.value,
        endDate: queryParameters
          .find(x => x['fieldId'] === 'date_range')
          ?.fractions[0].controls.find(control => control.name === 'end_date')
          ?.value
      }
    ];
  }

  let dimAndGroupExpressions = [];
  let mcAndGroupExpressions = [];

  if (dimOrExpressions.length > 0) {
    dimAndGroupExpressions.push({
      orGroup: { expressions: dimOrExpressions }
    });
  }

  if (dimAndNotExpressions.length > 0) {
    dimAndGroupExpressions = [
      ...dimAndGroupExpressions,
      ...dimAndNotExpressions
    ];
  }

  if (mcOrExpressions.length > 0) {
    mcAndGroupExpressions.push({
      orGroup: { expressions: mcOrExpressions }
    });
  }

  if (mcAndNotExpressions.length > 0) {
    mcAndGroupExpressions = [...mcAndGroupExpressions, ...mcAndNotExpressions];
  }

  let body = {
    dimensions: selectedDimensions.map(x => ({ name: x.meta['name'] })),
    metrics: selectedMeasures.map(x => ({ name: x.meta['name'] })),
    dateRanges: dateRanges,
    dimensionFilter:
      dimOrExpressions.length > 0 || dimAndNotExpressions.length > 0
        ? {
            andGroup: {
              expressions: dimAndGroupExpressions
            }
          }
        : undefined,
    metricFilter:
      mcOrExpressions.length > 0 || mcAndNotExpressions.length > 0
        ? {
            andGroup: {
              expressions: mcAndGroupExpressions
            }
          }
        : undefined,
    offset: undefined, // not supported
    limit: queryLimit,
    metricAggregations: undefined, // not supported
    orderBys: orderByElements,
    currencyCode: 'USD',
    cohortSpec: cohortSpec,
    keepEmptyRows: true,
    returnPropertyQuota: false,
    comparisons: undefined // not supported
  };

  console.log(body);
  console.log(body.dimensionFilter.andGroup.expressions);

  return body;
}

t3();
