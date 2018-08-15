<?php
/**
 * Created by PhpStorm.
 * User: cbrownroberts
 * Date: 7/14/16
 * Time: 1:23 PM
 */

namespace SubjectsPlus\Control\OAI;

use SubjectsPlus\Control\Querier;


class Record {

	private $connection;
	private $db;

	private $creator;
	private $date;
	private $description;
	private $format = 'text/html';
	private $identifier;
	private $language;
	private $publisher;
	private $title;
	private $type = 'InteractiveResource';
	private $collectionList;


	public function __construct( Querier $db ) {
		$this->db         = $db;
		$this->connection = $db->getConnection();
	}


	public function getRecord( $id ) {

		$record = $this->getSubject( $id );
		$staff  = $this->getStaff( $id );

		$this->setTitle( $record['subject'] );
		$this->setDate( $record['last_modified'] );
		$this->setDescription( $record['description'] );
		$this->setCreator( $staff['fname'] . ' ' . $staff['lname'] );

		$globalVars = $this->getGlobals();

		$this->setIdentifier( $id );
		$this->setPublisher( $globalVars['publisher'] );
		$this->setLanguage( $globalVars['language'] );
		$this->setCollectionList($this->getCollections($id));

	}

	private function getGlobals() {

		$globalVars = array();

		global $BaseURL;
		$globalVars['baseurl'] = $BaseURL;

		global $institution_name;
		if ( ! is_null( $institution_name ) ) {
			$globalVars['publisher'] = $institution_name;
		} else {
			$globalVars['publisher'] = "University of Miami Libraries";
		}

		global $language;
		if ( ! is_null( $language ) ) {
			$globalVars['language'] = $language;
		} else {
			$globalVars['language'] = 'English';
		}

		return $globalVars;
	}


	public function toArray() {
		return get_object_vars( $this );
	}


	public function getStaff( $subject_id ) {

		$statement = $this->connection->prepare( "SELECT fname, lname FROM staff 
                                                  INNER JOIN staff_subject
                                                  ON staff_subject.staff_id = staff.staff_id
                                                  WHERE staff_subject.subject_id = :id
                                                  AND staff.user_type_id = 1" );
		$statement->bindParam( ':id', $subject_id );
		$statement->execute();
		$result = $statement->fetch();

		return $result;
	}

	public function getCollections( $subject_id ) {

		$statement = $this->connection->prepare( "SELECT s.subject_id, s.subject, s.active, 
s.shortform, s.description, s.type, s.last_modified,k.title  
FROM subject s LEFT JOIN collection_subject c ON c.subject_id = s.subject_id 
LEFT JOIN collection k ON k.collection_id = c.collection_id  WHERE s.subject_id = :id AND s.active= '1'" );
		$statement->bindParam( ':id', $subject_id );
		$statement->execute();
		$result = $statement->fetchAll();

		return $result;
	}


	public function getSubject( $id ) {

		$statement = $this->connection->prepare( "SELECT * FROM subject WHERE subject_id = :id" );
		$statement->bindParam( ':id', $id );
		$statement->execute();
		$result = $statement->fetch();

		return $result;
	}


	/**
	 * @return mixed
	 */
	public function getCreator() {
		return $this->creator;
	}

	/**
	 * @param mixed $creator
	 */
	public function setCreator( $creator ) {
		$this->creator = $creator;
	}

	/**
	 * @return mixed
	 */
	public function getDate() {
		return $this->date;
	}

	/**
	 * @param mixed $date
	 */
	public function setDate( $date ) {
		$this->date = $date;
	}

	/**
	 * @return mixed
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * @param mixed $description
	 */
	public function setDescription( $description ) {
		$this->description = $description;
	}

	/**
	 * @return mixed
	 */
	public function getFormat() {
		return $this->format;
	}

	/**
	 * @param mixed $format
	 */
	public function setFormat( $format ) {
		$this->format = $format;
	}

	/**
	 * @return mixed
	 */
	public function getIdentifier() {
		return $this->identifier;
	}

	/**
	 * @param mixed $identifier
	 */
	public function setIdentifier( $identifier ) {
		$this->identifier = $identifier;
	}

	/**
	 * @return mixed
	 */
	public function getLanguage() {
		return $this->language;
	}

	/**
	 * @param mixed $language
	 */
	public function setLanguage( $language ) {
		$this->language = $language;
	}

	/**
	 * @return mixed
	 */
	public function getPublisher() {
		return $this->publisher;
	}

	/**
	 * @param mixed $publisher
	 */
	public function setPublisher( $publisher ) {
		$this->publisher = $publisher;
	}

	/**
	 * @return mixed
	 */
	public function getTitle() {
		return $this->title;
	}

	/**
	 * @param mixed $title
	 */
	public function setTitle( $title ) {
		$this->title = $title;
	}

	/**
	 * @return mixed
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * @param mixed $type
	 */
	public function setType( $type ) {
		$this->type = $type;
	}

	/**
	 * @return mixed
	 */
	public function getCollectionList() {
		return $this->collectionList;
	}

	/**
	 * @param mixed $collection
	 */
	public function setCollectionList( $collection ) {
		$collections = [];

		foreach ($collection as $coll){
			array_push($collections, $coll["title"]);
		}
		$this->collectionList = $collections;
	}




}
