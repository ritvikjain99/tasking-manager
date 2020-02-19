import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from '@reach/router';
import messages from '../views/messages';
import { FormattedMessage } from 'react-intl';
import editMessages from './projectEdit/messages';
import { styleClasses } from '../views/projectEdit';
import { UserAvatar } from './user/avatar';
import { fetchLocalJSONAPI } from '../network/genericJSONRequest';
import { PaginatorLine } from './paginator';
import { SettingsIcon, CheckIcon } from './svgIcons';
import Popup from 'reactjs-popup';

const UserFilter = ({ filters, setFilters, updateFilters, intl }) => {
  return (
    <div>
      <span className="b f5">
        <FormattedMessage {...messages.userTitle} />
      </span>
      <FormattedMessage {...messages.enterUsername}>
        {msg => {
          return (
            <input
              className={styleClasses.inputClass}
              type="text"
              name="username"
              onChange={e => updateFilters(e.target.name, e.target.value)}
              placeholder={msg}
              value={filters.username !== '' ? filters.username : null}
            />
          );
        }}
      </FormattedMessage>
    </div>
  );
};

const RoleFilter = ({ filters, setFilters, updateFilters }) => {
  const roles = ['ALL', 'MAPPER', 'VALIDATOR', 'PROJECT_MANAGER', 'ADMIN'];

  return (
    <div>
      <span className="b f5">
        <FormattedMessage {...editMessages.userRole} />
      </span>
      {roles.map(role => (
        <label className="db pv2 f5" key={role}>
          <input
            value={role}
            checked={filters.role === role}
            onChange={() => updateFilters('role', role)}
            type="radio"
            className={`radio-input input-reset pointer v-mid dib h1 w1 mr2 br-100 ba b--blue-light`}
          />
          <FormattedMessage {...editMessages[`userRole${role}`]} />
        </label>
      ))}
    </div>
  );
};

const MapperLevelFilter = ({ filters, setFilters, updateFilters }) => {
  const mapperLevels = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div>
      <span className="b f5">
        <FormattedMessage {...editMessages.mapperLevel} />
      </span>
      {mapperLevels.map(level => (
        <label className="db pv2 f5" key={level}>
          <input
            value={level}
            checked={filters.level === level}
            onChange={() => updateFilters('level', level)}
            type="radio"
            className={`radio-input input-reset pointer v-mid dib h1 w1 mr2 br-100 ba b--blue-light`}
          />
          <FormattedMessage {...editMessages[`mapperLevel${level}`]} />
        </label>
      ))}
    </div>
  );
};

export const SearchNav = ({ filters, setFilters }) => {
  const updateFilters = (field, value) => {
    setFilters(f => {
      return { ...f, [field]: value };
    });
  };

  return (
    <div className="w-25 fl">
      <h3 className="f4 ma0 pb4">
        <FormattedMessage {...messages.userSearch} />
      </h3>
      <div className="pb4">
        <UserFilter filters={filters} setFilters={setFilters} updateFilters={updateFilters} />
      </div>
      <div className="pb4">
        <MapperLevelFilter
          filters={filters}
          setFilters={setFilters}
          updateFilters={updateFilters}
        />
      </div>
      <div className="pb4">
        <RoleFilter filters={filters} setFilters={setFilters} updateFilters={updateFilters} />
      </div>
    </div>
  );
};

export const UsersTable = ({ filters, setFilters }) => {
  const token = useSelector(state => state.auth.get('token'));
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const fetchUsers = async filters => {
      const url = `users/?${filters}`;
      const res = await fetchLocalJSONAPI(url, token);
      setResponse(res);
    };

    // Filter elements according to logic.
    const urlFilters = Object.entries(filters)
      .map(([key, val]) => {
        if (key === 'role' || key === 'level') {
          if (val !== 'ALL') {
            return `${key}=${val}`;
          } else {
            return null;
          }
        }

        if (val !== '') {
          return `${key}=${val}`;
        }
        return null;
      })
      .filter(v => v !== null)
      .join('&');

    fetchUsers(urlFilters);
  }, [filters, token]);

  if (!token) {
    return <Redirect to={'login'} noThrow />;
  }

  if (response === null) {
    return null;
  }

  return (
    <div className="w-75 fl">
      <p className="f5 mt0">
        <FormattedMessage {...messages.totalUsers} values={{ total: response.pagination.total }} />
      </p>
      <div className="w-90 f6">
        <ul className="list pa0 ma0">
          {response.users.map(user => {
            return (
              <li className="cf flex items-center pv2 ph3-ns ph1 ba bw1 mb1 b--tan blue-dark">
                <div className="w-40 fl">
                  <UserAvatar
                    picture={user.pictureUrl}
                    username={user.username}
                    colorClasses="white bg-blue-grey"
                  />
                  <a
                    className="blue-grey mr2 ml3 link"
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`/users/${user.username}`}
                  >
                    {user.username}
                  </a>
                </div>
                <div className="w-30 fl">
                  <span className="ttu dib-ns dn">
                    <FormattedMessage {...editMessages[`mapperLevel${user.mappingLevel}`]} />
                  </span>
                </div>
                <div className="w-20 fl">
                  <span className="ttu dib-ns dn">
                    <FormattedMessage {...editMessages[`userRole${user.role}`]} />
                  </span>
                </div>
                <div className="w-10 fl tr">
                  <Popup
                    trigger={
                      <span>
                        <SettingsIcon
                          width="18px"
                          height="18px"
                          className="pointer hover-blue-grey"
                        />
                      </span>
                    }
                    position="right center"
                    closeOnDocumentClick
                    className="user-popup"
                  >
                    <UserEditMenu user={user} token={token} />
                  </Popup>
                </div>
              </li>
            );
          })}
        </ul>
        <PaginatorLine
          activePage={filters.page}
          setPageFn={val =>
            setFilters(f => {
              return { ...f, page: val };
            })
          }
          lastPage={response.pagination.pages}
          className="pv3 tr"
        />
      </div>
    </div>
  );
};

const UserEditMenu = ({ user, token }) => {
  const roles = ['MAPPER', 'VALIDATOR', 'PROJECT_MANAGER', 'ADMIN'];
  const mapperLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const iconClass = 'h1 w1';

  const updateRole = (username, role) => {
    fetchLocalJSONAPI(`users/${username}/actions/set-role/`);
  };

  return (
    <div className="w-100 f6 tl ph1">
      <div className="w-100 bb b--tan">
        <p className="b mv3">Set Role</p>
        {roles.map(r => {
          return (
            <div className="mv2 dim pointer w-100 flex items-center justify-between">
              <p onClick={() => updateRole(user.username, r)} className="ma0 pa0">
                <FormattedMessage {...editMessages[`userRole${r}`]} />
              </p>
              {r === user.role ? <CheckIcon className={iconClass} /> : null}
            </div>
          );
        })}
      </div>
      <div className="w-100">
        <p className="b mv3">Set mapper level</p>
        {mapperLevels.map(m => {
          return (
            <div className="mv2 dim pointer w-100 flex items-center justify-between">
              <p className="ma0 pa0">
                <FormattedMessage {...editMessages[`mapperLevel${m}`]} />
              </p>
              {m === user.mappingLevel ? <CheckIcon className={iconClass} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
