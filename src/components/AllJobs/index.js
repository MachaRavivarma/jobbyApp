import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {AiOutlineSearch} from 'react-icons/ai'
import Cookies from 'js-cookie'
import JobCardItem from '../JobCardItem'
import Header from '../Header'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class AllJobs extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    profileData: [],
    jobsData: [],
    apiJobsStatus: apiStatusConstants.initial,
    activeCheckBoxList: [],
    activeSalaryRangeId: '',
    searchInput: '',
  }

  componentDidMount() {
    this.getProfileData()
    this.getJobsData()
  }

  getProfileData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)
    if (response.ok === true) {
      const profile = data.profile_details
      const updatedProfileData = {
        name: profile.name,
        profileImageUrl: profile.profile_image_url,
        shortBio: profile.short_bio,
      }
      console.log(updatedProfileData)
      this.setState({
        profileData: updatedProfileData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  getJobsData = async () => {
    this.setState({apiJobsStatus: apiStatusConstants.inProgress})
    const {activeCheckBoxList, activeSalaryRangeId, searchInput} = this.state
    const type = activeCheckBoxList.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs?employment_type=${type}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)
    if (response.ok === true) {
      const filteredJobsList = data.jobs.map(each => ({
        id: each.id,
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))
      console.log(filteredJobsList)
      this.setState({
        jobsData: filteredJobsList,
        apiJobsStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiJobsStatus: apiStatusConstants.failure,
      })
    }
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSubmitSearchInput = () => {
    this.getJobsData()
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getJobsData()
    }
  }

  onSelectSalaryRange = event => {
    this.setState({activeSalaryRangeId: event.target.id}, this.getJobsData)
  }

  onClickCheckBox = event => {
    const {activeCheckBoxList} = this.state
    if (activeCheckBoxList.includes(event.target.id)) {
      const updatedList = activeCheckBoxList.filter(
        each => each !== event.target.id,
      )
      this.setState({activeCheckBoxList: updatedList}, this.getJobsData)
    } else {
      this.setState(
        prevState => ({
          activeCheckBoxList: [
            ...prevState.activeCheckBoxList,
            event.target.id,
          ],
        }),
        this.getJobsData,
      )
    }
  }

  onSuccessProfileView = () => {
    const {profileData} = this.state
    const {name, profileImageUrl, shortBio} = profileData
    return (
      <div className="profile-container">
        <img src={profileImageUrl} alt="profile" className="profile-icon" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-description">{shortBio}</p>
      </div>
    )
  }

  onSuccessJobsView = () => {
    const {jobsData} = this.state
    const noOfJobs = jobsData.length > 0
    return noOfJobs ? (
      <>
        <ul className="ul-job-items-container">
          {jobsData.map(each => (
            <JobCardItem key={each.id} item={each} />
          ))}
        </ul>
      </>
    ) : (
      <div className="no-of-jobs-container">
        <img
          className="no-jobs-img"
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
        />
        <h1>No jobs found</h1>
        <p>We could not find any jobs. Try other filters.</p>
      </div>
    )
  }

  onRetryProfile = () => this.getProfileData()

  onRetryJobs = () => this.getJobsData()

  onFailureProfileView = () => (
    <>
      <h1>profile Fail</h1>
      <button type="button" onClick={this.onRetryProfile}>
        Retry
      </button>
    </>
  )

  onFailJobsView = () => (
    <>
      <div className="failure-img-button-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
          alt="failure view"
          className="failure-view"
        />
        <h1 className="failure-heading">Oops! Something Went Wrong</h1>
        <p className="failure-paragraph">
          We cannot seem to find the page you are looking for
        </p>
        <div className="jobs-failure-button-container">
          <button
            className="failure-button"
            type="button"
            onClick={this.onRetryJobs}
          >
            Retry
          </button>
        </div>
      </div>
    </>
  )

  onLoading = () => (
    <div className="loader-container" data-testid="Loader">
      <Loader type="ThreeDots" height="50" width="50" color="#0b69ff" />
    </div>
  )

  onGetCheckBoxesView = () => (
    <ul className="check-box-container">
      {employmentTypesList.map(eachItem => (
        <li className="li-container" key={eachItem.employmentTypeId}>
          <input
            className="input"
            id={eachItem.employmentTypeId}
            type="checkbox"
            onChange={this.onClickCheckBox}
          />
          <label className="label" htmlFor={eachItem.employmentTypeId}>
            {eachItem.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onGetRadioButtonsView = () => (
    <ul className="radio-button-container">
      {salaryRangesList.map(eachItem => (
        <li className="li-container" key={eachItem.salaryRangeId}>
          <input
            className="input"
            id={eachItem.salaryRangeId}
            type="radio"
            onChange={this.onSelectSalaryRange}
            name="option"
          />
          <label className="label" htmlFor={eachItem.salaryRangeId}>
            {eachItem.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onRenderProfile = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.onSuccessProfileView()
      case apiStatusConstants.failure:
        return this.onFailureProfileView()
      case apiStatusConstants.inProgress:
        return this.onLoading()
      default:
        return null
    }
  }

  onRenderJobs = () => {
    const {apiJobsStatus} = this.state

    switch (apiJobsStatus) {
      case apiStatusConstants.success:
        return this.onSuccessJobsView()
      case apiStatusConstants.failure:
        return this.onFailJobsView()
      case apiStatusConstants.inProgress:
        return this.onLoading()
      default:
        return null
    }
  }

  onRenderSearch = () => {
    const {searchInput} = this.state
    return (
      <>
        <input
          className="search-input"
          type="search"
          value={searchInput}
          placeholder="Search"
          onChange={this.onChangeSearchInput}
          onKeyDown={this.onEnterSearchInput}
        />
        <button
          data-testid="searchButton"
          type="button"
          className="search-button"
          onClick={this.onSubmitSearchInput}
        >
          <AiOutlineSearch className="search-icon" />
        </button>
      </>
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="body-container">
          <div className="sm-search-container">{this.onRenderSearch()}</div>
          <div className="side-bar-container">
            {this.onRenderProfile()}
            <hr className="hr-line" />
            <h1 className="text">Type of Employment</h1>
            {this.onGetCheckBoxesView()}
            <hr className="hr-line" />
            <h1 className="text">Salary Range</h1>
            {this.onGetRadioButtonsView()}
          </div>
          <div className="jobs-container">
            <div className="lg-search-container">{this.onRenderSearch()}</div>
            {this.onRenderJobs()}
          </div>
        </div>
      </>
    )
  }
}

export default AllJobs
